<template>
  <canvas
    v-show="model"
    ref="canvas3d"
    :width="width"
    :height="height"/>
</template>

<script>
import DrawingTool from "/libs/DrawingTool";
import { Scene, Texture, sRGBEncoding, NearestFilter, PerspectiveCamera, Mesh, MeshBasicMaterial, WebGLRenderer} from 'three';
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
    width: Number,
    height: Number,
  },
  data: function() {
    return {
      scene: new Scene(),
      camera: new PerspectiveCamera( 75, 1, 0.1, 1000 ),
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
        this.texture = false;
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
      this.renderCanvas.getContext("2d").clearRect(0, 0, 128, 1);
      this.texture = new Texture(this.renderCanvas)
      this.texture.needsUpdate = true;
      this.texture.encoding = sRGBEncoding;
      this.texture.flipY = false;
      this.texture.magFilter = NearestFilter;
      let loader = new GLTFLoader();
      loader.load(path, (gltf) => {
        this.model = gltf.scene.children[0];
        this.model.traverse((child) => {
          if (child instanceof Mesh){child.material = new MeshBasicMaterial({map:this.texture});}
        });
        this.scene.add(this.model);
      });
    },
    animate: function(){
      if (this.model){this.model.rotation.y += 0.01;}
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
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

    this.animate();


    //If the type of pattern changes, change the model too
    this.drawingTool.onLoad(this.loadModel);
  }
}
</script>

