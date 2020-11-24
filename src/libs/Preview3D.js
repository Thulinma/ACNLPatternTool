import { DrawingTool, RenderTarget } from "~/libs/DrawingTool";
import ACNHFormat from '~/libs/ACNHFormat';
import { applyFilter } from '~/libs/xbrz';

//for 3D renders
import {
  Scene,
  Texture,
  sRGBEncoding,
  NearestFilter,
  OrthographicCamera,
  Mesh,
  MeshStandardMaterial,
  MeshPhongMaterial,
  WebGLRenderer,
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
  DoubleSide,
  TextureLoader,
  MixOperation,
  Vector3,
} from '@three/core';
import {
  GLTFLoader
} from '@three/loaders/GLTFLoader';
import injected from "~/utils/injected";

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

/// Returns model type for given DrawingTool instance.
/// 0 = Plain pattern
/// 1 = Upper body Clothing
/// 2 = Hat
/// 3 = Standee
export function toolToModelType(tool){
  if (tool.pattern instanceof ACNHFormat){
    switch (tool.patternType){
      case 0x00://Pattern
      case 0x01://Pro pattern
        return 0;
      case 0x0f://brimmed cap
      case 0x10://knit cap
      case 0x11://brimmed hat
      case 0x18://hat
      case 0x19://horned hat
        return 2;
      default: return 1;
    }
  }else{
    switch (tool.patternType){
      case 6:
      case 7: return 2; //Hats
      case 8: return 3; //Standee
      case 9: return 0; //Plain pattern
      default: return 1;//Everything else
    }
  }
}

/// Returns the 3D model path for the given DrawingTool instance
/// Returns false if there is no model available.
export function toolToModelPath(tool){
  if (tool.pattern instanceof ACNHFormat){
    switch (tool.patternType){
      case 0x00:
      case 0x01: return injected.easel;
      case 0x02: return injected.tank_simp;
      case 0x03: return injected.dressshirt_long;
      case 0x04: return injected.tee_short;
      case 0x05: return injected.tank_pro;
      case 0x06: return injected.sweater;
      case 0x07: return injected.hoodie;
      case 0x08: return injected.coat;
      case 0x09: return injected.dress_acnh_short;
      case 0x0A: return injected.dress_acnh_none;
      case 0x0B: return injected.dress_acnh_long;
      case 0x0C: return injected.dress_balloon;
      case 0x0D: return injected.dress_round;
      case 0x0E: return injected.robe;
      case 0x0f: return injected.brimmed_cap;
      case 0x10: return injected.knit_cap;
      case 0x11: return injected.brimmed_hat;
      case 0x12: return injected.dress_half;
      case 0x13: return injected.dress_long;
      case 0x14: return injected.dress_none;
      case 0x15: return injected.shirt_half;
      case 0x16: return injected.shirt_long;
      case 0x17: return injected.shirt_none;
      case 0x18: return injected.hat;
      case 0x19: return injected.hornhat;
      default: return false;
    }
  }else{
    switch (tool.patternType){
      case 0: return injected.dress_long;
      case 1: return injected.dress_half;
      case 2: return injected.dress_none;
      case 3: return injected.shirt_long;
      case 4: return injected.shirt_half;
      case 5: return injected.shirt_none;
      case 6: return injected.hornhat;
      case 7: return injected.hat;
      case 8: return false;
      case 9: return injected.easel;
      default: return false;
    }
  }
}


//Global model and texture loader instances
const mdlLdr = new GLTFLoader();
const texLdr = new TextureLoader();

//Loads the model for a clothing stand
export async function loadStand(){
  return new Promise(resolve => {
    mdlLdr.parse(JSON.stringify(injected.clothing_stand), "", (gltf) => {
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
function loadTexture(tex,name){
  return new Promise(r=>{
    texLdr.load(injected.getObjectUrl(tex),(done)=>{
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
  const path = toolToModelPath(tool);
  if (!path){return false;}//No model? Return early.
  const modelType = toolToModelType(tool);
  return new Promise(resolve => {
    mdlLdr.load(injected.getObjectUrl(path["model.gltf"]), (gltf) => {
      let ret = gltf.scene.children[0];
      let promises = [];
      ret.traverse((child) => {
        if (child instanceof Mesh){
          promises.push(new Promise(async (travResolve) => {
            const meshName = child.name.split("__")[1];
            if (path.hasOwnProperty(meshName+"_Nrm.png")){
              child.material.normalMap = await loadTexture(path[meshName+"_Nrm.png"],"normalmap");
              child.material.normalMap.flipY = false;
            }
            if (path.hasOwnProperty(meshName+"_Crv.png")){
              child.material.lightMap = await loadTexture(path[meshName+"_Crv.png"],"lightmap");
              child.material.lightMap.flipY = false;
            }
            if (path.hasOwnProperty(meshName+"_OP.png")){
              child.material.alphaMap = await loadTexture(path[meshName+"_OP.png"],"alphamap");
              child.material.alphaMap.flipY = false;
              child.material.transparent = true;
              child.material.alphaTest = 0.5;
            }
            if (path.hasOwnProperty(meshName+"_Mix.png")){
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
                img.src = injected.getObjectUrl(path[meshName+"_Mix.png"]);
              });
            }
            if (path.hasOwnProperty(meshName+"_Alb.png")){
              child.material.map = await loadTexture(path[meshName+"_Alb.png"],"material");
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
            child.material.roughness = ((modelType == 0) ? 0.5 : 1.5);//easel is more shiny
            travResolve();
          }));
        }
      });
      ret.position.z = 0;
      ret.position.x = 0;
      if (modelType == 0){//easel
        ret.position.y = -7;
      }else if (modelType == 2){//hat
        ret.position.y = -1;
      }else{//everything else
        ret.position.y = -6;
      }
      texture.needsUpdate = true;
      Promise.all(promises).then(() => resolve(ret)).catch(()=>resolve(false)); 
    });
  });
}

export async function drawPreviewFromTool(ctx, tool, x, y, width, height){
  //Check if we should 3D render or not
  let modelType = toolToModelType(tool);
  if (modelType == 0 || modelType == 3){//Plain patterns and standees

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
    if (modelType == 1){
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
    if (modelType == 0){//Easel
      camUp = 40;
      camPan = -3.5;
      scale = 25;
    }else if (modelType == 2){//Hat
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
    //Free ThreeJS-related resources
    scene.dispose();
    texture.dispose();
  }
}


