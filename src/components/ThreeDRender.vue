<template>
  <canvas
    class="threeD"
    v-show="model"
    ref="canvas3d"
    @mousemove.prevent="onRotate"
    @mousedown.prevent="onRotateStart"
    @mouseup.prevent="onRotateStop"
    @mouseout="onRotateStop"
    @wheel.prevent="onZoom"
    :width="width"
    :height="height"/>
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
  WebGLRenderer,
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
  DoubleSide,
} from '@three/core';
import {
  GLTFLoader
} from '@three/loaders/GLTFLoader';
import injected from "/utils/injected";

const scale = 35;

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
      model: false,
      adjusting: false,
      rotating: false,
      hasAnimReq: false,
      rotx: 0,
      roty: 0,
      rotstart: 0,
    };
  },
  methods: {
    onRotate(e){
      if (this.adjusting){
        this.model.rotation.y = this.rotstart - (this.rotx - e.offsetX)/100;
        this.animate();
      }
    },
    onRotateStart(e){
      this.adjusting = true;
      this.rotating = false;
      this.rotx = e.offsetX;
      this.roty = e.offsetY;
      this.rotstart = this.model.rotation.y;
    },
    onRotateStop(e){
      this.adjusting = false;
      if (this.rotx == e.offsetX && this.roty == e.offsetY){this.rotating=true;}
      if (!this.hasAnimReq){this.hasAnimReq = requestAnimationFrame(this.animate);}
    },
    onZoom(e){
      if (this.model && e.deltaY != 0){
        const d = (e.deltaMode == 0)?e.deltaY/20:e.deltaY;
        this.camera.position.z += d/5;
        if (this.camera.position.z > 15){this.camera.position.z = 15;}
        if (this.camera.position.z < 3){this.camera.position.z = 3;}
        //this.camera.position.y = this.camera.position.z + 15;
        if (!this.hasAnimReq){this.hasAnimReq = requestAnimationFrame(this.animate);}
      }
    },
    loadModel(d){
      if (this.model){
        this.scene.remove(this.model);
        this.model = false;
      }
      let path;
      let modelOffset = {x: 0, y:0, z:0, rough: 0.75};
      if (d.pattern instanceof ACNHFormat){
        switch (d.patternType){
          case 0x00://Pattern
          case 0x01://Pro pattern
            path = injected.easel;
            modelOffset.rough = 0.5;
            break;
          case 0x02://plain tank top
            path = injected.tank_simp;
            modelOffset.y = 5;
            break;
          case 0x03://ls dress shirt
            path = injected.dressshirt_long;
            modelOffset.y = 5;
            break;
          case 0x04://short sleeve tee
            path = injected.tee_short;
            modelOffset.y = 5;
            break;
          case 0x05://pro tank top
            path = injected.tank_pro;
            modelOffset.y = 5;
            break;
          case 0x06://sweater
            path = injected.sweater;
            modelOffset.y = 5;
            break;
          case 0x07://hoodie
            path = injected.sweater;
            modelOffset.y = 5;
            break;
          case 0x08://coat
            path = injected.coat;
            modelOffset.y = 5;
            break;
          case 0x09://shortsleeve dress
            path = injected.dress_acnh_short;
            modelOffset.y = 5;
            break;
          case 0x0A://sleeveless dress
            path = injected.dress_acnh_none;
            modelOffset.y = 5;
            break;
          case 0x0B://long sleeve dress
            path = injected.dress_acnh_long;
            modelOffset.y = 5;
            break;
          case 0x0C://balloon hem dress
            path = injected.dress_balloon;
            modelOffset.y = 5;
            break;
          case 0x0D://round dress
            path = injected.dress_round;
            modelOffset.y = 5;
            break;
          case 0x0E://robe
            path = injected.robe;
            modelOffset.y = 5;
            break;
          case 0x0f://brimmed cap
            path = injected.brimmed_cap;
            modelOffset.y = 5;
            break;
          case 0x10://knit cap
            path = injected.knit_cap;
            modelOffset.y = 5;
            break;
          case 0x11://brimmed hat
            path = injected.brimmed_hat;
            modelOffset.y = 5;
            break;
          case 0x13:
            path = injected.dress_long;
            modelOffset.y = 5;
            break;
          case 0x17:
            path = injected.shirt_none;
            modelOffset.y = 5;
            break;
          case 0x18:
            path = injected.hat;
            modelOffset.y = 5;
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
          case 6: path = injected.hornhat; break;
          case 7: path = injected.hat; break;
          case 9:
            path = injected.easel;
            modelOffset.rough = 0.5;
          break;
          default: return;
        }
      }
      this.renderCanvas.getContext("2d").clearRect(0, 0, 128, 1);
      let loader = new GLTFLoader();
      loader.parse(JSON.stringify(path), "", (gltf) => {
        if (this.model){this.scene.remove(this.model);}
        this.model = gltf.scene.children[0];
        this.model.traverse((child) => {
          if (child instanceof Mesh){
            if (child.skeleton && child.skeleton.bones && child.skeleton.bones.length){
              for (let b in child.skeleton.bones){
                if (child.skeleton.bones[b].name == "Arm_1_R"){
                  child.skeleton.bones[b].rotation.z += 0.5;
                }
                if (child.skeleton.bones[b].name == "Arm_1_L"){
                  child.skeleton.bones[b].rotation.z -= 0.5;
                }
              }
            }
            if (!child.material.map || (child.material.map.image.width == 1 && child.material.map.image.height == 1)) {
              child.material.map = this.texture;
            }
            child.material.side = DoubleSide;
            child.material.metalness = 0;
            child.material.roughness = modelOffset.rough;
          }
        });
        this.model.position.x = modelOffset.x;
        this.model.position.y = modelOffset.y;
        this.model.position.z = modelOffset.z;
        this.scene.add(this.model);
        if (!this.hasAnimReq){this.hasAnimReq = requestAnimationFrame(this.animate);}
      });
      this.pixelCanvas.height = this.pixelCanvas.width = this.drawingTool.width;
      this.renderCanvas.height = this.renderCanvas.width = this.drawingTool.width*4;
      this.drawingTool.render();
    },
    animate(){
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
    this.pixelCanvas.height = this.pixelCanvas.width = this.drawingTool.width;
    this.renderCanvas.height = this.renderCanvas.width = this.drawingTool.width*4;
    this.drawingTool.addCanvas(this.pixelCanvas, {drawCallback:()=>{
      applyFilter(this.pixelCanvas, this.renderCanvas);
      this.texture.needsUpdate = true;
      if (!this.hasAnimReq){this.hasAnimReq = requestAnimationFrame(this.animate);}
    }});

    let renderContext = this.renderCanvas.getContext('2d');
    renderContext.fillStyle = "rgba(255,255,255,0)";
    renderContext.fillRect(0, 0, 32, 128);

    this.camera.position.z = 15;
    this.camera.position.y = 9;
    this.camera.rotation.x = -0.1;

    this.scene.add( new AmbientLight(0xffffff, 0.3) );

    const dirLight = new DirectionalLight( 0xffffff, 0.85 );
    dirLight.position.set( -1, 0.75, 1 );
    dirLight.position.multiplyScalar( 50);
    this.scene.add( dirLight );

    this.hasAnimReq = requestAnimationFrame(this.animate);


    //If the type of pattern changes, change the model too
    this.drawingTool.onLoad(this.loadModel);
    this.loadModel(this.drawingTool);
  }
}
</script>

<style lang="scss" scoped>
</style>
