<template v-for="i in 1">
  <div class="editor">
    <Palette
      ref="palette"
      v-bind:drawing-tool="drawingTool"
      v-on:changed-current-color="onChangedCurrentColor"/>
    <ColorPicker
      ref="colorPicker"
      v-bind:drawing-tool="drawingTool"
      v-on:color-picked="onColorPicked"/>
    <div>
      <canvas ref="canvas1" width="512" height="512"/>
      <canvas ref="canvas2" width="128" height="128"/>
      <canvas ref="canvas3" width="64" height="64"/>
      <canvas ref="canvas3d" width="64" height="64"/>
    </div>
    <label for="files" style="color:white;">Load ACNL file:</label>
    <input type="file" name="files" id="files" v-on:change="onFile">
  </div>
</template>

<script>
import ColorPicker from "/components/ColorPicker.vue";
import Palette from "/components/Palette.vue";
import DrawingTool from "/libs/DrawingTool";
import logger from "/utils/logger";
import lzString from 'lz-string';

//3D-related
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import model_dress_long from "/assets/resources/dress_long.gltf";
import model_dress_half from "/assets/resources/dress_half.gltf";
import model_dress_none from "/assets/resources/dress_none.gltf";
import model_shirt_long from "/assets/resources/shirt_long.gltf";
import model_shirt_half from "/assets/resources/shirt_half.gltf";
import model_shirt_none from "/assets/resources/shirt_none.gltf";

export default {
  name: "Editor",
  components: {
    ColorPicker,
    Palette
  },
  beforeRouteUpdate (to, from, next) {
    if (to.hash.length > 1){
      let newHash = lzString.compressToEncodedURIComponent(this.drawingTool.toString());
      if (to.hash != "#"+newHash){
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(to.hash.substring(1)));
      }
    }
    next();
  },
  data: function() {
    return {
      drawingTool: new DrawingTool(),
      fragment: "",
    };
  },
  methods: {
    onColorPicked: function(color) {
      this.drawingTool.setPalette(this.drawingTool.currentColor, color);
      this.$refs.palette.palChange();
    },
    onChangedCurrentColor: function(idx) {
      this.drawingTool.currentColor = idx;
      this.$refs.colorPicker.forceCheck();
    },
    onFile: function(e){
      console.log(e);
      var readNew = new FileReader();
      readNew.onload = (re) => {this.drawingTool.load(re.target.result);}
      readNew.readAsArrayBuffer(e.target.files[0]);
    },
    onLoad: function(t){
      this.$refs.palette.palChange();
      this.$refs.colorPicker.forceCheck();
      let newHash = lzString.compressToEncodedURIComponent(this.drawingTool.toString());
      if (this.$router.currentRoute.hash != "#"+newHash){
        this.$router.push({hash:newHash});
      }
    }
  },
  mounted: function() {
    this.drawingTool.addCanvas(this.$refs.canvas1);
    this.drawingTool.addCanvas(this.$refs.canvas2);
    this.drawingTool.addCanvas(this.$refs.canvas3);
    this.drawingTool.onLoad(this.onLoad);


    /// Set up everything needed for 3D rendering textures
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    var renderer = new THREE.WebGLRenderer({"canvas":this.$refs.canvas3d});
    var texture;
    var renderCanvas = document.createElement('canvas');
    renderCanvas.width = 32;
    renderCanvas.height = 128;
    this.drawingTool.addCanvas(renderCanvas, {tall:true});

    var renderContext = renderCanvas.getContext('2d');
    renderContext.fillStyle = "rgba(255,255,255,1)";
    renderContext.fillRect(0, 0, 32, 128);

    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.setSize(128, 128);
    camera.position.z = 15;
    camera.position.y = 30;
    camera.rotation.x = 5.6;

    var model = false;
    function animate() {
      if (model){
        model.rotation.y += 0.01;
      }
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    /// Loads a new 3D model for the pattern
    function loadModel(path){
      if (model){
        scene.remove(model);
        model = false;
      }
      if (path == ""){return;}
      var loader = new GLTFLoader();
      loader.load(path, function(gltf){
        model = gltf.scene.children[0];
        model.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            texture = new THREE.Texture(renderCanvas) 
            texture.needsUpdate = true;
            texture.encoding = THREE.sRGBEncoding;
            texture.flipY = false;
            texture.magFilter = THREE.NearestFilter;
            child.material = new THREE.MeshBasicMaterial({map:texture});
          }
        });
        scene.add(model);
      }, undefined, function(){ });
    }

    //If the type of pattern changes, change the model too
    this.drawingTool.onLoad((d) => {
      function getTypeModel(n){
        switch (n){
          case 0: return model_dress_long;
          case 1: return model_dress_half;
          case 2: return model_dress_none;
          case 3: return model_shirt_long;
          case 4: return model_shirt_half;
          case 5: return model_shirt_none;
          default: return "";
        }
      }
      loadModel(getTypeModel(d.pattern.patternType));
    });


    if (this.$router.currentRoute.hash.length > 1){
      this.drawingTool.load(lzString.decompressFromEncodedURIComponent(this.$router.currentRoute.hash.substring(1)));
    }else{
      this.drawingTool.render();
    }
  }
}
</script>

<style scoped>
.editor {
  user-select: none;
}
</style>
