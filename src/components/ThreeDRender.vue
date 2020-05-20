<template>
  <canvas
    class="three-d"
    v-show="model"
    ref="canvas3d"
    :width="width"
    :height="height"
  />
</template>

<script>
import DrawingTool from "/libs/DrawingTool";
import ACNHFormat from "/libs/ACNHFormat";
import { applyFilter } from '/libs/xbrz';

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
} from '@three/core';
import {
  GLTFLoader
} from '@three/loaders/GLTFLoader';
import {
  OrbitControls
} from '@three/controls/OrbitControls';
import injected from "/utils/injected";

const scale = 50;

const loader = new GLTFLoader();
const texLdr = new TextureLoader();

export default {
  name: "ThreeDRender",
  props: {
    drawingTool: DrawingTool,
    width: Number,
    height: Number,
  },
  data: function() {
    return {
      scene: new Scene(),
      camera: new OrthographicCamera( -this.width/scale, this.width/scale, this.height/scale, -this.height/scale, 0.1, 1000 ),
      renderer: null,
      pixelCanvas: document.createElement('canvas'),
      renderCanvas: document.createElement('canvas'),
      texture: null,
      dirLight: false,
      model: false,
      stand: false,
      adjusting: false,
      rotating: false,
      hasAnimReq: false,
      rotx: 0,
      roty: 0,
      rotstart: 0,
    };
  },
  methods: {
    loadModel(d){
      if (this.model){
        this.scene.remove(this.model);
        this.model = false;
      }
      let path;
      let modelOffset = {x: 0, y:-6, z:0, rough: 1.5};
      this.controls.maxZoom = 2.0;
      this.controls.minZoom = 0.8;
      this.camera.position.set( 0, 20, 100 );
      this.controls.update();
      let modelType = 1;
      if (d.pattern instanceof ACNHFormat){
        switch (d.patternType){
          case 0x00://Pattern
          case 0x01://Pro pattern
            path = injected.easel;
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
          case 0x13:
            path = injected.dress_long;
            break;
          case 0x17:
            path = injected.shirt_none;
            break;
          case 0x18:
            path = injected.hat;
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
          case 9:
            path = injected.easel;
            modelType = 0;
          break;
          default: return;
        }
      }
      let stand = true;
      switch (modelType){
        case 0://easel style
          modelOffset.rough = 0.5;
          modelOffset.y = -7;
          stand = false;
          this.controls.maxZoom = 2.0;
          this.controls.minZoom = 0.8;
          this.controls.zoom = 1.5;
          this.controls.update();
        break;
        case 1://clothing style
          this.controls.maxZoom = 4.0;
          this.controls.minZoom = 1.5;
          this.controls.update();
        break;
        case 2://hat style
          modelOffset.y = -1;
          stand = false;
          this.controls.maxZoom = 2.0;
          this.controls.minZoom = 0.8;
          this.controls.update();
        break;
      }
      this.$refs.canvas3d.dispatchEvent(new WheelEvent("wheel", {"deltaY":50}));
      this.scene.remove(this.stand);
      if (stand && this.stand){this.scene.add(this.stand);}
      this.renderCanvas.getContext("2d").clearRect(0, 0, 128, 1);
      this.mixImg = false;
      loader.load(injected.getObjectUrl(path["model.gltf"]), (gltf) => {
        if (this.model){this.scene.remove(this.model);}
        this.model = gltf.scene.children[0];
        this.model.traverse((child) => {
          if (child instanceof Mesh){
            console.log(child);
            //child.material = new MeshPhongMaterial();
            const meshName = child.name.split("__")[1];
            const redraw = ()=>{
              if (!this.hasAnimReq){this.hasAnimReq = requestAnimationFrame(this.animate);}
            };
            if (path.hasOwnProperty(meshName+"_Nrm.png")){
              child.material.normalMap = texLdr.load(injected.getObjectUrl(path[meshName+"_Nrm.png"]), redraw);
              child.material.normalMap.flipY = false;
            }
            if (path.hasOwnProperty(meshName+"_Crv.png")){
              child.material.lightMap = texLdr.load(injected.getObjectUrl(path[meshName+"_Crv.png"], redraw));
              child.material.lightMap.flipY = false;
            }
            if (path.hasOwnProperty(meshName+"_OP.png")){
              child.material.alphaMap = texLdr.load(injected.getObjectUrl(path[meshName+"_OP.png"], redraw));
              child.material.alphaMap.flipY = false;
              child.material.transparent = true;
              child.material.alphaTest = 0.5;
            }
            if (path.hasOwnProperty(meshName+"_Mix.png")){
              this.mixImg = new Image();
              this.mixImg.onload = ()=>{this.drawingTool.render(); redraw();}
              this.mixImg.src = injected.getObjectUrl(path[meshName+"_Mix.png"]);
            }
            if (path.hasOwnProperty(meshName+"_Alb.png")){
              child.material.map = texLdr.load(injected.getObjectUrl(path[meshName+"_Alb.png"], redraw));
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
              child.material.map = this.texture;
            }
            child.material.side = DoubleSide;
            child.material.metalness = 0;
            child.material.shininess = 9;
            child.material.roughness = modelOffset.rough;
          }
        });
        this.model.position.x = modelOffset.x;
        this.model.position.y = modelOffset.y;
        this.model.position.z = modelOffset.z;
        this.scene.add(this.model);
        if (!this.hasAnimReq){this.hasAnimReq = requestAnimationFrame(this.animate);}
      });
      this.pixelCanvas.height = this.pixelCanvas.width = this.drawingTool.texWidth;
      this.renderCanvas.height = this.renderCanvas.width = this.drawingTool.texWidth*4;
      this.drawingTool.render();
    },
    animate(){
      this.controls.update();
      this.dirLight.position.set(this.camera.position.x+2, this.camera.position.y+1, this.camera.position.z+4);
      this.dirLight.position.multiplyScalar( 50);
      this.renderer.render(this.scene, this.camera);
      if (!this.rotating || !this.model){
        this.hasAnimReq = false;
      }else{
        this.model.rotation.y += 0.01;
        this.hasAnimReq = requestAnimationFrame(this.animate);
      }
    }
  },
  mounted: function() {

    this.texture = new Texture(this.renderCanvas)
    this.texture.needsUpdate = true;
    this.texture.encoding = sRGBEncoding;
    this.texture.flipY = false;

    this.renderer = new WebGLRenderer({alpha:true, canvas:this.$refs.canvas3d, antialias:true});
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setClearColor( 0x000000, 0 );
    this.pixelCanvas.height = this.pixelCanvas.width = this.drawingTool.texWidth;
    this.renderCanvas.height = this.renderCanvas.width = this.drawingTool.texWidth*4;
    this.drawingTool.addCanvas(this.pixelCanvas, {texture:true, drawCallback:()=>{
      applyFilter(this.pixelCanvas, this.renderCanvas);
      if (this.mixImg){
        const ctx = this.renderCanvas.getContext('2d');
        ctx.globalAlpha = 0.75;
        ctx.drawImage(this.mixImg,0,0,this.renderCanvas.width,this.renderCanvas.height);
        ctx.globalAlpha = 1;
      }
      this.texture.needsUpdate = true;
      if (!this.hasAnimReq){this.hasAnimReq = requestAnimationFrame(this.animate);}
    }});

    let renderContext = this.renderCanvas.getContext('2d');
    renderContext.fillStyle = "rgba(255,255,255,0)";
    renderContext.fillRect(0, 0, 32, 128);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.addEventListener('change', ()=>{
      if (!this.hasAnimReq){this.hasAnimReq = requestAnimationFrame(this.animate);}
    });
    this.camera.position.set( 0, 20, 100 );
    this.controls.update();

    this.scene.add( new AmbientLight(0xffffff, 0.2) );

    this.dirLight = new DirectionalLight( 0xffffff, 0.8 );
    this.scene.add( this.dirLight );

    this.hasAnimReq = requestAnimationFrame(this.animate);


    //If the type of pattern changes, change the model too
    this.drawingTool.onLoad(this.loadModel);
    this.loadModel(this.drawingTool);


    loader.parse(JSON.stringify(injected.clothing_stand), "", (gltf) => {
      this.stand = gltf.scene.children[0];
      this.stand.traverse((child) => {
        if (child instanceof Mesh){
          child.material.side = DoubleSide;
          child.material.metalness = 0.3;
          child.material.roughness = 0.3;
        }
      });
      this.stand.position.y = -6;
    });

  }
}
</script>

<style lang="scss" scoped>
.three-d {
  outline: none;
  cursor: all-scroll;
}
</style>
