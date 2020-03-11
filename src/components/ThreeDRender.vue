<template>
  <canvas
    class="threeD"
    v-show="model"
    ref="canvas3d"
    v-on:mousemove.prevent="onRotate"
    v-on:mousedown.prevent="onRotateStart"
    v-on:mouseup.prevent="onRotateStop"
    v-on:mouseout="onRotateStop"
    v-on:wheel.prevent="onZoom"
    :width="width"
    :height="height"/>
</template>

<script>
import DrawingTool from "/libs/DrawingTool";
import {
  Scene,
  Texture,
  sRGBEncoding,
  NearestFilter,
  PerspectiveCamera,
  Mesh,
  MeshBasicMaterial,
  WebGLRenderer
} from '@three/core';
import {
  GLTFLoader
} from '@three/loaders/GLTFLoader';
import injected from "/utils/injected";

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
      camera: new PerspectiveCamera( 75, this.width/this.height, 0.1, 1000 ),
      renderer: null,
      renderCanvas: document.createElement('canvas'),
      texture: null,
      model: false,
      adjusting: false,
      rotating: true,
      hasAnimReq: false,
      rotx: 0,
      roty: 0,
      rotstart: 0
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
        if (this.camera.position.z < 12){this.camera.position.z = 12;}
        if (this.camera.position.z > 35){this.camera.position.z = 35;}
        this.camera.position.y = this.camera.position.z + 15;
        if (!this.hasAnimReq){this.hasAnimReq = requestAnimationFrame(this.animate);}
      }
    },
    loadModel(d){
      if (this.model){
        this.scene.remove(this.model);
        this.model = false;
        this.texture = false;
      }
      let path;
      switch (d.patternType){
        case 0: path = injected.dress_long; break;
        case 1: path = injected.dress_half; break;
        case 2: path = injected.dress_none; break;
        case 3: path = injected.shirt_long; break;
        case 4: path = injected.shirt_half; break;
        case 5: path = injected.shirt_none; break;
        default: return;
      }
      this.renderCanvas.getContext("2d").clearRect(0, 0, 128, 1);
      this.texture = new Texture(this.renderCanvas)
      this.texture.needsUpdate = true;
      this.texture.encoding = sRGBEncoding;
      this.texture.flipY = false;
      this.texture.magFilter = NearestFilter;
      let loader = new GLTFLoader();
      loader.parse(JSON.stringify(path), "", (gltf) => {
        this.model = gltf.scene.children[0];
        this.model.traverse((child) => {
          if (child instanceof Mesh){child.material = new MeshBasicMaterial({map:this.texture});}
        });
        this.scene.add(this.model);
        if (!this.hasAnimReq){this.hasAnimReq = requestAnimationFrame(this.animate);}
      });
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
    this.renderer = new WebGLRenderer({alpha:true, canvas:this.$refs.canvas3d})
    this.renderer.setClearColor( 0x000000, 0 );
    this.renderCanvas.width = 128;
    this.renderCanvas.height = 512;
    this.drawingTool.addCanvas(this.renderCanvas, {tall:true, drawCallback:()=>{
      if (this.texture){this.texture.needsUpdate = true;}
    }});

    let renderContext = this.renderCanvas.getContext('2d');
    renderContext.fillStyle = "rgba(255,255,255,1)";
    renderContext.fillRect(0, 0, 32, 128);

    this.camera.position.z = 15;
    this.camera.position.y = 30;
    this.camera.rotation.x = 5.6;

    this.hasAnimReq = requestAnimationFrame(this.animate);


    //If the type of pattern changes, change the model too
    this.drawingTool.onLoad(this.loadModel);
  }
}
</script>

<style lang="scss" scoped>
</style>
