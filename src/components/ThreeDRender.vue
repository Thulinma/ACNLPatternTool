<template>
  <canvas v-show="model" ref="canvas3d" v-bind:width="width" v-bind:height="height"/>
</template>

<script>
import DrawingTool from "/libs/DrawingTool";
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import model_dress_long from "/assets/resources/dress_long.gltf";
import model_dress_half from "/assets/resources/dress_half.gltf";
import model_dress_none from "/assets/resources/dress_none.gltf";
import model_shirt_long from "/assets/resources/shirt_long.gltf";
import model_shirt_half from "/assets/resources/shirt_half.gltf";
import model_shirt_none from "/assets/resources/shirt_none.gltf";

export default {
  name: "ThreeDRender",
  props: {
    drawingTool: DrawingTool,
  },
  data: function() {
    return {
      width:0,
      height:0,
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 ),
      renderer: null,
      renderCanvas: document.createElement('canvas'),
      texture: null,
      model: false,
    };
  },
  methods: {
    loadModel: function(d){
      if (this.model){
        this.scene.remove(this.model);
        this.model = false;
      }
      let path;
      switch (d.patternType){
        case 0: path = model_dress_long; break;
        case 1: path = model_dress_half; break;
        case 2: path = model_dress_none; break;
        case 3: path = model_shirt_long; break;
        case 4: path = model_shirt_half; break;
        case 5: path = model_shirt_none; break;
        default: return;
      }
      let loader = new GLTFLoader();
      loader.load(path, (gltf) => {
        this.model = gltf.scene.children[0];
        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh){child.material = new THREE.MeshBasicMaterial({map:this.texture});}
        });
        this.scene.add(this.model);
      }, undefined, function(){ });
    },
    animate: function(){
      if (this.model){this.model.rotation.y += 0.01;}
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    }
  },
  mounted: function() {
    this.renderer = new THREE.WebGLRenderer({"canvas":this.$refs.canvas3d})
    this.renderCanvas.width = 32;
    this.renderCanvas.height = 128;
    this.drawingTool.addCanvas(this.renderCanvas, {tall:true});

    let renderContext = this.renderCanvas.getContext('2d');
    renderContext.fillStyle = "rgba(255,255,255,1)";
    renderContext.fillRect(0, 0, 32, 128);

    //this.renderer.outputEncoding = THREE.GammaEncoding;
    //this.renderer.gammaFactor = 2.2;
    //this.renderer.setSize(128, 128);
    this.camera.position.z = 15;
    this.camera.position.y = 30;
    this.camera.rotation.x = 5.6;

    this.texture = new THREE.Texture(this.renderCanvas) 
    this.texture.needsUpdate = true;
    this.texture.encoding = THREE.sRGBEncoding;
    this.texture.flipY = false;
    this.texture.magFilter = THREE.NearestFilter;

    this.animate();


    //If the type of pattern changes, change the model too
    this.drawingTool.onLoad(this.loadModel);
  }
}
</script>

