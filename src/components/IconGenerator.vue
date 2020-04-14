<template>
  <canvas ref="iCanvas" @click="pattClick" :width="width" :height="height" />
</template>

<script>
import DrawingTool from "/libs/DrawingTool";

//for 3D renders
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
import injected from "../utils/injected";
import ACNLFormat from '/libs/ACNLFormat';
import ACNHFormat from '/libs/ACNHFormat';

export default {
  name: "IconGenerator",
  props: ["pattern", "decoration", "text", "width", "height"],
  data: function(){return {};},
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
    async draw(newData){
      const width=this.$refs.iCanvas.width;
      const height=this.$refs.iCanvas.height;
      //Load pattern, prepare render canvas
      let drawingTool;
      if (newData instanceof DrawingTool){
        drawingTool = newData;
      }else{
        drawingTool = new DrawingTool(newData);
      }
      let tInfo = drawingTool.typeInfo;
      if (!tInfo || !tInfo.size){tInfo = {size: 32};}
      const bytes = drawingTool.toBytes();
      const renderCanvas = document.createElement("canvas");
      //Check if we should 3D render or not
      let path3D = null;
      if (drawingTool.pattern instanceof ACNLFormat){
        switch (drawingTool.patternType){
          case 0: path3D = injected.dress_long; break;
          case 1: path3D = injected.dress_half; break;
          case 2: path3D = injected.dress_none; break;
          case 3: path3D = injected.shirt_long; break;
          case 4: path3D = injected.shirt_half; break;
          case 5: path3D = injected.shirt_none; break;
        }
      }
      if (path3D){
        //We need to 3D render!
        renderCanvas.width = 128;
        renderCanvas.height = 512;
        drawingTool.addCanvas(renderCanvas, {tall:true});
        drawingTool.render();
        renderCanvas.getContext("2d").clearRect(0, 0, 128, 1);
      } else {
        //Regular render
        renderCanvas.width = tInfo.size;
        renderCanvas.height = tInfo.size;
        drawingTool.addCanvas(renderCanvas);
        drawingTool.render();
      }

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
      const pattCenter = width/2;

      const bgCanvas = document.createElement("canvas");
      bgCanvas.width=45;
      bgCanvas.height=45;
      const bgCtx = bgCanvas.getContext("2d");
      if (this.decoration){
        //Create pretty background pattern on temp canvas
        bgCtx.fillStyle = "#FFFFFF";
        bgCtx.fillRect(0, 0, 45, 45);
        bgCtx.fillStyle = "#9b9b9b44";
        bgCtx.rotate(Math.PI / 4);
        bgCtx.fillRect(0, -80, 16, 160);
        bgCtx.fillRect(32, -80, 16, 160);
        bgCtx.rotate(-Math.PI / 2);
        bgCtx.fillRect(0, -80, 16, 160);
        bgCtx.fillRect(-32, -80, 16, 160);
        //Copy background to main canvas
        ctx.fillStyle = ctx.createPattern(bgCanvas, "repeat");
        ctx.fillRect(0, 0, width, height);
      }

      //Draw the pattern itself to canvas
      if (!path3D){
        const pattSize = Math.floor((height-(this.text?20:0))/sPh);
        pattHeight = pattSize*sPh;
        ctx.drawImage(renderCanvas, 0, 0, sPw, sPh, pattCenter-(sPw*pattSize)/2, 20+((height-20)-pattSize*sPh)/2, pattSize*sPw, pattHeight);
      }else{
        pattHeight = height-20;
        //3D render!
        let threeCanvas = document.createElement("canvas");
        threeCanvas.width = width;
        threeCanvas.height = pattHeight;
        let renderer = new WebGLRenderer({alpha:true, canvas:threeCanvas,antialias:true});
        let scene = new Scene();
        let camera = new PerspectiveCamera(75, threeCanvas.width/threeCanvas.height, 0.1, 1000);
        let model = false;
        renderer.setClearColor( 0x000000, 0 );
        let texture = new Texture(renderCanvas)
        texture.needsUpdate = true;
        texture.encoding = sRGBEncoding;
        texture.flipY = false;
        texture.magFilter = NearestFilter;
        const texMat = new MeshBasicMaterial({map:texture});
        let loadModel = (x) => {return new Promise(resolve => {
          let loader = new GLTFLoader();
          loader.parse(JSON.stringify(x), "", (gltf) => {resolve(gltf);});
        });};
        let gltf = await loadModel(path3D);
        model = gltf.scene.children[0];
        model.traverse((child) => {
          if (child instanceof Mesh){child.material = texMat;}
        });
        scene.add(model);
        camera.position.z = 15;
        camera.position.y = 25;
        camera.rotation.x = 5.85;
        renderer.render(scene, camera);
        ctx.drawImage(threeCanvas, 0, 0, threeCanvas.width, threeCanvas.height, 0, (this.text?20:0)+(height-(this.text?20:0)-pattHeight)/2, threeCanvas.width, threeCanvas.height);
        //Free ThreeJS-related resources
        scene.dispose();
        texMat.dispose();
        texture.dispose();
        renderer.dispose();
      }

      if (this.text){
        //Prepare background pattern for text
        bgCanvas.width=1;
        bgCanvas.height=2;
        bgCtx.fillStyle = "#585858";
        bgCtx.fillRect(0, 0, 1, 1);
        bgCtx.fillStyle = "#3e3e3e";
        bgCtx.fillRect(0, 1, 1, 1);
        const txtBg = ctx.createPattern(bgCanvas, "repeat");

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
          ctx.fillStyle="#00000088";
          ctx.strokeStyle="#00000088";
          ctx.fillText(txt, x+2, y+2);
          ctx.fillStyle=fore;
          ctx.strokeStyle=fore;
          ctx.fillText(txt, x, y);
        }


        //Write text
        ctx.textBaseline = "middle";
        ctx.textAlign = 'center';

        ctx.font = '10pt Calibri';
        drawTxtWithBg(width/2, 10, drawingTool.title, "#FFFFFF");
      }

    }
  }
}
</script>

<style lang="scss" scoped>
canvas {
  margin:20px;
  display:inline-block;
}
</style>
