import { RenderTarget } from "@/libs/DrawingTool";
import ACNHFormat from '@/libs/ACNHFormat';
import { applyFilter } from '@/libs/xbrz';
import {
  ModelType,
  typeInfoToModelType,
  typeInfoToModelUrlData,
} from "@/libs/typeMappings";
import { clothingStand } from "@/models";

//for 3D renders
import {
  Scene,
  Texture,
  sRGBEncoding,
  OrthographicCamera,
  Mesh,
  WebGLRenderer,
  DirectionalLight,
  AmbientLight,
  DoubleSide,
  TextureLoader,
  Vector3,
} from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

//Global canvas and renderer
let threeCanvas = document.createElement("canvas");
threeCanvas.width = 100;
threeCanvas.height = 100;
let renderer = new WebGLRenderer({ alpha: true, canvas: threeCanvas, antialias: true});
renderer.outputEncoding = sRGBEncoding;
renderer.setClearColor(0x000000, 0);

/// Helper function that renders onto the given context at the give coordinates, a given scene and camera with the given width and height.
export function renderToContext(ctx, scene, camera, x, y, width, height){
  renderer.setSize(width, height);
  renderer.render(scene, camera);
  ctx.drawImage(threeCanvas, 0, 0, width, height, x, y, width, height);
}


/// Renders the given DrawingTool instance to a canvas element with upscaling algorithm applied and returns it.
export function toolToUpscaledCanvas(tool, transparent = true){
  //Prepare the canvases and render target
  const texW = tool.texWidth;
  const pixelCanvas = document.createElement('canvas');
  pixelCanvas.width = pixelCanvas.height = texW;
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = renderCanvas.height = texW*4;
  const r = new RenderTarget(pixelCanvas, {tool});
  r.calcZoom(texW, texW);

  //Build lookup table of palette colors
  let palette = [];
  for (let i = 0; i < 16; ++i){palette.push(tool.getPalette(i));}

  //Do render + upscale
  tool.renderToTarget(r, palette);
  applyFilter(pixelCanvas, renderCanvas);
  return renderCanvas;
}

//Global model and texture loader instances
const mdlLdr = new GLTFLoader();
const texLdr = new TextureLoader();

//Loads the model for a clothing stand
export async function loadStand(){
  return new Promise(resolve => {
    mdlLdr.load(clothingStand.modelUrl, (gltf) => {
      let ret = gltf.scene.children[0];
      ret.traverse((child) => {
        if (child instanceof Mesh){
          child.material.side = DoubleSide;
          child.material.metalness = 0.3;
          child.material.roughness = 0.3;
        }
      });
      ret.position.y = -6;
      resolve(ret);
    });
  });
}

/// Helper function that loads a texture with some basic error handling
function loadTexture(url,name){
  return new Promise(r=>{
    texLdr.load(url,(done)=>{
      r(done);
    },undefined,()=>{
      console.log("Failed loading texture "+name);
      r(false);
    });
  });
}

/// Loads the 3D model for the given DrawingTool instance and returns it.
/// Returns false if there is no available model or there was a load failure.
/// Note: Will draw to the textureCanvas if a mix image is available for the model!
export async function loadModelForTool(tool, texture, textureCanvas){
  const modelUrlData = typeInfoToModelUrlData.get(tool.typeInfo);
  if (!modelUrlData){return false;}//No model? Return early.
  const modelType = typeInfoToModelType.get(tool.typeInfo);
  return new Promise(resolve => {
    mdlLdr.load(modelUrlData.modelUrl, (gltf) => {
      let ret = gltf.scene.children[0];
      let promises = [];
      ret.traverse((child) => {
        if (child instanceof Mesh){
          promises.push(new Promise(async (travResolve) => {
            const meshName = child.name.split("__")[1];
            if (modelUrlData.nrmUrl){
              child.material.normalMap = await loadTexture(modelUrlData.nrmUrl,"normalmap");
              child.material.normalMap.flipY = false;
            }
            if (modelUrlData.crvUrl){
              child.material.lightMap = await loadTexture(modelUrlData.crvUrl,"lightmap");
              child.material.lightMap.flipY = false;
            }
            if (modelUrlData.opUrl){
              child.material.alphaMap = await loadTexture(modelUrlData.opUrl,"alphamap");
              child.material.alphaMap.flipY = false;
              child.material.transparent = true;
              child.material.alphaTest = 0.5;
            }
            if (modelUrlData.mixUrl){
              await new Promise((d) => {
                let img = new Image();
                img.onload = ()=>{
                  let ctx = textureCanvas.getContext('2d');
                  ctx.globalAlpha = 0.75;
                  ctx.drawImage(img,0,0,textureCanvas.width,textureCanvas.height);
                  ctx.globalAlpha = 1;
                  d();
                }
                img.onerror = d;
                img.src = modelUrlData.mixUrl;
              });
            }
            if (modelUrlData.albUrl){
              child.material.map = await loadTexture(modelUrlData.albUrl,"material");
              child.material.map.flipY = false;
            }
            if (child.skeleton && child.skeleton.bones && child.skeleton.bones.length){
              for (let b in child.skeleton.bones){
                if (child.skeleton.bones[b].name == "Arm_1_R"){
                  child.skeleton.bones[b].rotation.z += 0.75;
                }
                if (child.skeleton.bones[b].name == "Arm_1_L"){
                  child.skeleton.bones[b].rotation.z -= 0.75;
                }
              }
            }
            if (!child.material.map || (child.material.map.image && child.material.map.image.width == 1 && child.material.map.image.height == 1)) {
              child.material.map = texture;
            }
            child.material.side = DoubleSide;
            child.material.metalness = 0;
            child.material.shininess = 9;
            child.material.roughness = ((modelType === ModelType.Cloth) ? 0.5 : 1.5);//easel is more shiny
            travResolve();
          }));
        }
      });
      ret.position.z = 0;
      ret.position.x = 0;
      if (modelType === ModelType.Cloth){//easel
        ret.position.y = -7;
      } else if (modelType === ModelType.Hat){//hat
        ret.position.y = -1;
      } else{//everything else
        ret.position.y = -6;
      }
      texture.needsUpdate = true;
      Promise.all(promises).then(() => resolve(ret)).catch(()=>resolve(false)); 
    });
  });
}

export async function drawPreviewFromTool(ctx, tool, x, y, width, height){
  //Check if we should 3D render or not
  let modelType = typeInfoToModelType.get(tool.typeInfo);
  if (modelType === ModelType.Cloth || modelType === ModelType.Standee){//Plain patterns and standees

    //2D mode
    let tInfo = tool.typeInfo;
    if (!tInfo || !tInfo.size) tInfo = { size: 32 }
    let sPw = tInfo.size;//default pattern width
    let sPh = tInfo.size;//default pattern height
    if (tInfo.sections instanceof Array){//If we have a simple pattern type, take the custom width/height from it
      sPw = tInfo.sections[2];//custom width
      sPh = tInfo.sections[3];//custom height
    }
    var multiplier = Math.floor(Math.min(width / sPw, height / sPh));
    let offX = Math.floor((width-(sPw*multiplier))/2);
    let offY = Math.floor((height-(sPh*multiplier))/2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(toolToUpscaledCanvas(tool), 0, 0, sPw*4, sPh*4, x+offX, y+offY, sPw*multiplier, sPh*multiplier);
    ctx.imageSmoothingEnabled = true;

  }else{
    //3D mode

    let scene = new Scene();

    //Prepare texture
    const renderCanvas = toolToUpscaledCanvas(tool, false); //disable transparency
    let texture = new Texture(renderCanvas)
    texture.encoding = sRGBEncoding;
    texture.flipY = false;

    //Upper body clothing needs a stand to hold to model
    if (modelType === ModelType.Top){
      let stand = await loadStand();
      scene.add(stand);
    }

    //Load model and add to scene
    try{
    let model = await loadModelForTool(tool, texture, renderCanvas);
    if (model){scene.add(model);}
    }catch(e){
      console.log("Could not load model: ", e);
    }

    //Create and position the camera
    let scale = 45;
    let camUp = 20;
    let camPan = 0;
    if (modelType === ModelType.Cloth){//Easel
      camUp = 40;
      camPan = -3.5;
      scale = 25;
    } else if (modelType === ModelType.Hat){//Hat
      camUp = 80;
      scale = 30;
    }
    let factor = 190/Math.min(width,height);
    scale /= factor;
    let camera = new OrthographicCamera( -width/scale, width/scale, height/scale, -height/scale, 0.1, 100000 );
    camera.position.set( 0, camUp, 100);
    camera.lookAt(new Vector3(0,0,camPan));

    //Set up scene lighting
    let ambLight = new AmbientLight(0xffffff, 0.2);
    scene.add(ambLight);
    let dirLight = new DirectionalLight(0xffffff, 0.8);
    scene.add(dirLight);
    dirLight.position.set(camera.position.x+2, camera.position.y+1, camera.position.z+4);
    dirLight.position.multiplyScalar(50);

    //Render the scene
    renderToContext(ctx, scene, camera, x, y, width, height);
  }
}


