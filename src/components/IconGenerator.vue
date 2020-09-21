<template>
  <canvas ref="iCanvas" @click="pattClick" :width="width" :height="height" />
</template>

<script>
import DrawingTool from "/libs/DrawingTool";
import ACNHFormat from '/libs/ACNHFormat';
import { applyFilter } from '/libs/xbrz';

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
import injected from "/utils/injected";


export default {
  name: 'IconGenerator',
  props: ["pattern", "decoration", "text", "width", "height"],
  watch: {
    //Whenever pattern changes, draw it!
    pattern (newData, oldData) {
      this.draw(newdata);
    }
  },
  mounted: async function(){
    await this.draw(this.pattern);
  },
  methods: {
    pattClick(){
      this.$emit('pattclick', this.pattern);
    },
    async draw(newData) {
      const loader = new GLTFLoader();
      const texLdr = new TextureLoader();

      const width = this.$refs.iCanvas.width;
      const height = this.$refs.iCanvas.height;
      //Load pattern, prepare render canvas
      let d;
      if (newData instanceof DrawingTool){
        d = newData;
      } else {
        d = new DrawingTool(newData);
      }
      let tInfo = d.typeInfo;
      if (!tInfo || !tInfo.size) tInfo = { size: 32 }
      const bytes = d.toBytes();

      //Check if we should 3D render or not
      let path = null;
      let modelOffset = {x: 0, y:-6, z:0, rough: 1.5};
      let modelType = 1;
      if (d.pattern instanceof ACNHFormat){
        switch (d.patternType){
          case 0x00://Pattern
          case 0x01://Pro pattern
            //path = injected.easel;
            modelType = 0;
            break;
          case 0x02://plain tank top
            path = injected.tank_simp;
            break;
          case 0x03://ls dress shirt
            path = injected.dressshirt_long;
            break;
          case 0x04://short sleeve tee
            path = injected.tee_short;
            break;
          case 0x05://pro tank top
            path = injected.tank_pro;
            break;
          case 0x06://sweater
            path = injected.sweater;
            break;
          case 0x07://hoodie
            path = injected.hoodie;
            break;
          case 0x08://coat
            path = injected.coat;
            break;
          case 0x09://shortsleeve dress
            path = injected.dress_acnh_short;
            break;
          case 0x0A://sleeveless dress
            path = injected.dress_acnh_none;
            break;
          case 0x0B://long sleeve dress
            path = injected.dress_acnh_long;
            break;
          case 0x0C://balloon hem dress
            path = injected.dress_balloon;
            break;
          case 0x0D://round dress
            path = injected.dress_round;
            break;
          case 0x0E://robe
            path = injected.robe;
            break;
          case 0x0f://brimmed cap
            path = injected.brimmed_cap;
            modelType = 2;
            break;
          case 0x10://knit cap
            path = injected.knit_cap;
            modelType = 2;
            break;
          case 0x11://brimmed hat
            path = injected.brimmed_hat;
            modelType = 2;
            break;
          case 0x12://short sleeve dress
            path = injected.dress_half;
            break;
          case 0x13://long sleeve dress
            path = injected.dress_long;
            break;
          case 0x14://sleeveless dress
            path = injected.dress_none;
            break;
          case 0x15://short sleeve shirt
            path = injected.shirt_half;
            break;
          case 0x16://long sleeve shirt
            path = injected.shirt_long;
            break;
          case 0x17://sleeveless shirt
            path = injected.shirt_none;
            break;
          case 0x18://hat
            path = injected.hat;
            modelType = 2;
            break;
          case 0x19://horned hat
            path = injected.hornhat;
            modelType = 2;
            break;
          default: return;
        }

      }else{
        switch (d.patternType){
          case 0: path = injected.dress_long; break;
          case 1: path = injected.dress_half; break;
          case 2: path = injected.dress_none; break;
          case 3: path = injected.shirt_long; break;
          case 4: path = injected.shirt_half; break;
          case 5: path = injected.shirt_none; break;
          case 6:
            path = injected.hornhat;
            modelType = 2;
          break;
          case 7:
            path = injected.hat;
            modelType = 2;
          break;
          case 8:
          break;
          case 9:
            modelType = 0;
            //path = injected.easel;
          break;
          default: return;
        }
      }

      //Generate the pixel and fancy versions of the pattern
      const pixelCanvas = document.createElement('canvas');
      pixelCanvas.width = pixelCanvas.height = d.texWidth;
      const renderCanvas = document.createElement('canvas');
      renderCanvas.width = renderCanvas.height = d.texWidth*4;
      d.addCanvas(pixelCanvas);
      d.render();
      applyFilter(pixelCanvas, renderCanvas);

      //Ensure blitted images are not smoothed ( = keep pixel look!)
      let ctx = this.$refs.iCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;


      //Calculate sizes for various bits
      let pattHeight = 0; //is calculated later
      let sPw = tInfo.size;//default pattern width
      let sPh = tInfo.size;//default pattern height
      if (tInfo.sections instanceof Array){//If we have a simple pattern type, take the custom width/height from it
        sPw = tInfo.sections[2];//custom width
        sPh = tInfo.sections[3];//custom height
      }
      const pattCenter = width / 2;

      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = 45;
      bgCanvas.height = 45;
      const bgCtx = bgCanvas.getContext('2d');
      if (this.decoration){
        //Create pretty background pattern on temp canvas
        bgCtx.fillStyle = '#FFFFFF';
        bgCtx.fillRect(0, 0, 45, 45);
        bgCtx.fillStyle = '#9b9b9b44';
        bgCtx.rotate(Math.PI / 4);
        bgCtx.fillRect(0, -80, 16, 160);
        bgCtx.fillRect(32, -80, 16, 160);
        bgCtx.rotate(-Math.PI / 2);
        bgCtx.fillRect(0, -80, 16, 160);
        bgCtx.fillRect(-32, -80, 16, 160);
        //Copy background to main canvas
        ctx.fillStyle = ctx.createPattern(bgCanvas, 'repeat');
        ctx.fillRect(0, 0, width, height);
      }

      //Draw the pattern itself to canvas
      if (!path){
        const pattSize = Math.floor(( height - (this.text ? 20 : 0) ) / sPh);
        pattHeight = pattSize*sPh;
        ctx.drawImage(renderCanvas, 0, 0, sPw*4, sPh*4, pattCenter - (sPw*pattSize) /2, 20 + ((height-20)-pattSize*sPh)/2, pattSize*sPw, pattHeight);
      }else{



        pattHeight = height-20;
        //3D render!
        let threeCanvas = document.createElement("canvas");
        threeCanvas.width = width;
        threeCanvas.height = pattHeight;
        let renderer = new WebGLRenderer({ alpha: true, canvas: threeCanvas, antialias: true});
        renderer.outputEncoding = sRGBEncoding;
        renderer.setClearColor( 0x000000, 0 );

        let scene = new Scene();

        let scale = 45;
        let camUp = 20;
        let camPan = 0;

        let stand = true;
        switch (modelType){
          case 0://easel style
            modelOffset.rough = 0.5;
            modelOffset.y = -7;
            stand = false;
            camUp = 40;
            camPan = -3.5;
            scale = 25;
          break;
          case 1://clothing style
          break;
          case 2://hat style
            modelOffset.y = -1;
            stand = false;
            camUp = 80;
            scale = 30;
          break;
        }

        let camera = new OrthographicCamera( -threeCanvas.width/scale, threeCanvas.width/scale, threeCanvas.height/scale, -threeCanvas.height/scale, 0.1, 100000 );
        camera.position.set( 0, camUp, 100);

        let texture = new Texture(renderCanvas)
        texture.encoding = sRGBEncoding;
        texture.flipY = false;

        if (stand){
          stand = await new Promise(resolve => {
            loader.parse(JSON.stringify(injected.clothing_stand), "", (gltf) => {
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
          scene.add(stand);
        }

        let mixImg = false;

        let model = await new Promise(resolve => {
          loader.load(injected.getObjectUrl(path["model.gltf"]), (gltf) => {
            let ret = gltf.scene.children[0];
            ret.traverse(async (child) => {
              if (child instanceof Mesh){
                const meshName = child.name.split("__")[1];
                /* For some reason this breaks...?
                if (path.hasOwnProperty(meshName+"_Nrm.png")){
                  child.material.normalMap = await new Promise(r=>{texLdr.load(injected.getObjectUrl(path[meshName+"_Nrm.png"]),r);});
                  child.material.normalMap.flipY = false;
                }
                */
                if (path.hasOwnProperty(meshName+"_Crv.png")){
                  child.material.lightMap = await new Promise(r=>{texLdr.load(injected.getObjectUrl(path[meshName+"_Crv.png"],r));});
                  child.material.lightMap.flipY = false;
                }
                if (path.hasOwnProperty(meshName+"_OP.png")){
                  child.material.alphaMap = await new Promise(r=>{texLdr.load(injected.getObjectUrl(path[meshName+"_OP.png"],r));});
                  child.material.alphaMap.flipY = false;
                  child.material.transparent = true;
                  child.material.alphaTest = 0.5;
                }
                if (path.hasOwnProperty(meshName+"_Mix.png")){
                  mixImg = injected.getObjectUrl(path[meshName+"_Mix.png"]);
                }
                if (path.hasOwnProperty(meshName+"_Alb.png")){
                  child.material.map = await new Promise(r=>{texLdr.load(injected.getObjectUrl(path[meshName+"_Alb.png"],r));});
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
                child.material.roughness = modelOffset.rough;
              }
            });
            ret.position.x = modelOffset.x;
            ret.position.y = modelOffset.y;
            ret.position.z = modelOffset.z;
            resolve(ret);
          });
        });
        scene.add(model);

        if (mixImg){
          await new Promise((d) => {
            let img = new Image();
            img.onload = ()=>{
              let ctx = renderCanvas.getContext('2d');
              ctx.globalAlpha = 0.75;
              ctx.drawImage(img,0,0,renderCanvas.width,renderCanvas.height);
              ctx.globalAlpha = 1;
              d();
            }
            img.onerror = d;
            img.src = mixImg;
          });
        }
        texture.needsUpdate = true;

        camera.lookAt(new Vector3(0,0,camPan));

        let ambLight = new AmbientLight(0xffffff, 0.2);
        scene.add(ambLight);

        let dirLight = new DirectionalLight(0xffffff, 0.8);
        scene.add(dirLight);
        dirLight.position.set(camera.position.x+2, camera.position.y+1, camera.position.z+4);
        dirLight.position.multiplyScalar(50);

        renderer.render(scene, camera);
        ctx.drawImage(threeCanvas, 0, 0, threeCanvas.width, threeCanvas.height, 0, (this.text?20:0)+(height-(this.text?20:0)-pattHeight)/2, threeCanvas.width, threeCanvas.height);
        //Free ThreeJS-related resources
        scene.dispose();
        texture.dispose();
        renderer.forceContextLoss();
        renderer.dispose();
      }

      if (this.text){
        //Prepare background pattern for text
        bgCanvas.width=1;
        bgCanvas.height=2;
        bgCtx.fillStyle = '#585858';
        bgCtx.fillRect(0, 0, 1, 1);
        bgCtx.fillStyle = '#3e3e3e';
        bgCtx.fillRect(0, 1, 1, 1);
        const txtBg = ctx.createPattern(bgCanvas, 'repeat');

        const drawTxtWithBg = (x, y, txt, fore) => {
          const txtProps = ctx.measureText(txt);
          var h = (txtProps.fontBoundingBoxAscent?txtProps.fontBoundingBoxAscent:txtProps.actualBoundingBoxAscent) + (txtProps.fontBoundingBoxDescent?txtProps.fontBoundingBoxDescent:txtProps.actualBoundingBoxDescent)+4;
          var w = txtProps.width-h/2;
          ctx.fillStyle=txtBg;
          ctx.strokeStyle=fore;
          //Calculate background
          ctx.beginPath();
          ctx.arc(x-w/2, y, h/2, 0.5*Math.PI, 1.5*Math.PI);
          ctx.lineTo(x+w/2, y-h/2);
          ctx.arc(x+w/2, y, h/2, 1.5*Math.PI, 0.5*Math.PI);
          ctx.lineTo(x+-w/2, y+h/2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle='#00000088';
          ctx.strokeStyle='#00000088';
          ctx.fillText(txt, x+2, y+2);
          ctx.fillStyle=fore;
          ctx.strokeStyle=fore;
          ctx.fillText(txt, x, y);
        }


        //Write text
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        ctx.font = '10pt Calibri';
        drawTxtWithBg(width/2, 10, d.title, '#FFFFFF');
      }

    }
  }
}
</script>

<style lang="scss" scoped>
canvas {
  margin: 10px;
  display: inline-block;
}
</style>
