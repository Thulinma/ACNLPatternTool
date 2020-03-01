<template v-for="i in 1">
  <canvas ref="qrcanvas"/>
</template>

<script>
import DrawingTool from "/libs/DrawingTool";
import logger from "/utils/logger";

//For QR generation
import { QRCodeEncoder, QRCodeDecoderErrorCorrectionLevel, EncodeHintType } from '@zxing/library';

//for 3D renders
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import model_dress_long from "/assets/resources/dress_long.gltf";
import model_dress_half from "/assets/resources/dress_half.gltf";
import model_dress_none from "/assets/resources/dress_none.gltf";
import model_shirt_long from "/assets/resources/shirt_long.gltf";
import model_shirt_half from "/assets/resources/shirt_half.gltf";
import model_shirt_none from "/assets/resources/shirt_none.gltf";

export default {
  name: "ACNLQRGenerator",
  props: ["pattern", "width", "height"],
  data: function(){return {};},
  methods: {
    //Makes a suggestion as to what would be a good size for the QR code for this pattern
    suggestSizeFor(data){
      if (((typeof data) == "string" && data.length > 620) || data.byteLength > 620){
        return [800, 450];
      }else{
        return [480, 250];
      }
    }
  },
  watch: {
    //Whenever pattern changes, draw it!
    async pattern(data){
      //Update internal canvas size to width/height
      //Only happens right before redraw
      this.$refs.qrcanvas.width = this.width;
      this.$refs.qrcanvas.height = this.height;
      //Ensure blitted images are not smoothed ( = keep pixel look!)
      let ctx = this.$refs.qrcanvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;




      //Load pattern, prepare render canvas
      const drawingTool = new DrawingTool(data);
      const tInfo = drawingTool.typeInfo;
      const bytes = drawingTool.toBytes();
      const renderCanvas = document.createElement("canvas");
      //Check if we should 3D render or not
      let path3D;
      switch (drawingTool.patternType){
        case 0: path3D = model_dress_long; break;
        case 1: path3D = model_dress_half; break;
        case 2: path3D = model_dress_none; break;
        case 3: path3D = model_shirt_long; break;
        case 4: path3D = model_shirt_half; break;
        case 5: path3D = model_shirt_none; break;
      }
      if (path3D){
        //We need to 3D render!
        renderCanvas.width = 128;
        renderCanvas.height = 512;
        drawingTool.addCanvas(renderCanvas, {tall:true});
        drawingTool.render();
        renderCanvas.getContext("2d").clearRect(0, 0, 128, 1);
      }else{
        //Regualar render
        renderCanvas.width = tInfo.size;
        renderCanvas.height = tInfo.size;
        drawingTool.addCanvas(renderCanvas);
        drawingTool.render();
      }

      //Create QR code(s) in memory
      let codes = [];
      if (bytes.byteLength > 620){
        const hints = new Map();
        const parityByte = Math.round(Math.random()*255);
        hints.set(EncodeHintType.STRUCTURED_APPEND, [0, 3, parityByte]);
        codes.push(QRCodeEncoder.encode(new Uint8Array(bytes, 0, 540), QRCodeDecoderErrorCorrectionLevel.M, hints));
        hints.set(EncodeHintType.STRUCTURED_APPEND, [1, 3, parityByte]);
        codes.push(QRCodeEncoder.encode(new Uint8Array(bytes, 540, 540), QRCodeDecoderErrorCorrectionLevel.M, hints));
        hints.set(EncodeHintType.STRUCTURED_APPEND, [2, 3, parityByte]);
        codes.push(QRCodeEncoder.encode(new Uint8Array(bytes, 1080, 540), QRCodeDecoderErrorCorrectionLevel.M, hints));
        hints.set(EncodeHintType.STRUCTURED_APPEND, [3, 3, parityByte]);
        codes.push(QRCodeEncoder.encode(new Uint8Array(bytes, 1620, 540), QRCodeDecoderErrorCorrectionLevel.M, hints));
      }else{
        codes.push(QRCodeEncoder.encode(new Uint8Array(bytes), QRCodeDecoderErrorCorrectionLevel.M, null));
      }

      //Calculate sizes for various bits
      let sQR = 0;
      codes.forEach((c) => {if (c.getMatrix().getWidth()*2 > sQR){sQR = c.getMatrix().getWidth()*2;}});
      let pattHeight = 0; //is calculated later
      let sPw = tInfo.size;//default pattern width
      let sPh = tInfo.size;//default pattern height
      if (tInfo.sections instanceof Array){//If we have a simple pattern type, take the custom width/height from it
        sPw = tInfo.sections[2];//custom width
        sPh = tInfo.sections[3];//custom height
      }


      //Create pretty background pattern on temp canvas
      const bgCanvas = document.createElement("canvas");
      bgCanvas.width=45;
      bgCanvas.height=45;
      const bgCtx = bgCanvas.getContext("2d");
      bgCtx.fillStyle = "#FFFFFF";
      bgCtx.fillRect(0, 0, 45, 45);
      bgCtx.fillStyle = "#9b003a44";
      bgCtx.rotate(Math.PI / 4);
      bgCtx.fillRect(0, -80, 16, 160);
      bgCtx.fillRect(32, -80, 16, 160);
      bgCtx.rotate(-Math.PI / 2);
      bgCtx.fillRect(0, -80, 16, 160);
      bgCtx.fillRect(-32, -80, 16, 160);
      //Copy background to main canvas
      ctx.fillStyle = ctx.createPattern(bgCanvas, "repeat");
      ctx.fillRect(0, 0, this.width, this.height);

      //Draw the pattern itself to canvas
      if (!path3D){
        const pattSize = Math.floor((this.height-45)/sPh);
        pattHeight = pattSize*sPh;
        ctx.drawImage(renderCanvas, 0, 0, sPw, sPh, (this.width/2-sPw*pattSize)/2, (this.height-pattHeight)/2, pattSize*sPw, pattHeight);
      }else{
        pattHeight = this.height-45;
        //3D render!
        let threeCanvas = document.createElement("canvas");
        threeCanvas.width = this.width;
        threeCanvas.height = pattHeight/2;
        let renderer = new THREE.WebGLRenderer({alpha:true, canvas:threeCanvas});
        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(75, threeCanvas.width/threeCanvas.height, 0.1, 1000);
        let model = false;
        renderer.setClearColor( 0x000000, 0 );
        let texture = new THREE.Texture(renderCanvas) 
        texture.needsUpdate = true;
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = false;
        texture.magFilter = THREE.NearestFilter;
        let loadModel = (x) => {return new Promise(resolve => {
          let loader = new GLTFLoader();
          loader.load(x, (gltf) => {resolve(gltf);});
        });};
        let gltf = await loadModel(path3D);
        model = gltf.scene.children[0];
        model.traverse((child) => {
          if (child instanceof THREE.Mesh){child.material = new THREE.MeshBasicMaterial({map:texture});}
        });
        scene.add(model);
        camera.position.z = 15;
        camera.position.y = 25;
        camera.rotation.x = 5.85;
        renderer.render(scene, camera);
        ctx.drawImage(threeCanvas, 0, 0, threeCanvas.width, threeCanvas.height, -this.width/4, (this.height-pattHeight)/2, threeCanvas.width, threeCanvas.height);
        model.rotation.y = Math.PI;
        renderer.render(scene, camera);
        ctx.drawImage(threeCanvas, 0, 0, threeCanvas.width, threeCanvas.height, -this.width/4, (this.height-pattHeight)/2+threeCanvas.height, threeCanvas.width, threeCanvas.height);
      }

      function drawTxtWithBg(x, y, txt, ctx, fore, back){
        const txtProps = ctx.measureText(txt);
        var h = txtProps.fontBoundingBoxAscent + txtProps.fontBoundingBoxDescent+4;
        var w = txtProps.width-h/2;
        ctx.fillStyle=back;
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

      //Prepare background pattern for text
      bgCanvas.width=1;
      bgCanvas.height=2;
      bgCtx.fillStyle = "#792e58";
      bgCtx.fillRect(0, 0, 1, 1);
      bgCtx.fillStyle = "#883e5f";
      bgCtx.fillRect(0, 1, 1, 1);
      let txtBg = ctx.createPattern(bgCanvas, "repeat");

      //Write text
      ctx.textBaseline = "middle";
      ctx.textAlign = 'center';
      ctx.font = '15pt Calibri';
      drawTxtWithBg(this.width*0.25, (this.height-pattHeight)/4, drawingTool.title, ctx, "#FFFFFF", txtBg);
      ctx.font = '12pt Calibri';
      drawTxtWithBg(this.width*0.25, this.height-(this.height-pattHeight)/4, "By "+drawingTool.creator[0] + " from "+drawingTool.town[0], ctx, "#FFFFFF", txtBg);

      //Draws the passed QRCode with top left corner on the x/y location.
      //We access the encoder directly and use a custom drawing implementation, because going through a SVG is blergh.
      const qrToCanvas = (QR, x, y) => {
        const pixelSize = 2;
        const input = QR.getMatrix();
        const qrSize = input.getWidth();//We assume width==height. It should be...
        //Draw all black blocks (BG is already white, after all!)
        ctx.fillStyle = "#000000";
        for (let inputY = 0; inputY < qrSize; inputY++) {
            for (let inputX = 0; inputX < qrSize; inputX++) {
                if (input.get(inputX, inputY) === 1){
                  ctx.fillRect(x+inputX*pixelSize, y+inputY*pixelSize, pixelSize, pixelSize);
                }
            }
        }
      };

      //Prepare pretty side decoration
      bgCanvas.width=3;
      bgCanvas.height=6;
      bgCtx.fillStyle = "#FFFFFF";
      bgCtx.fillRect(0, 0, 3, 6);
      bgCtx.fillStyle = "#c7b98c";
      bgCtx.fillRect(0.5, 0, 2, 4);

      //Write QR code to canvas
      if (bytes.byteLength > 620){
        const spc = 12;//spacing
        const QRx = Math.round(this.width*0.75);//center x for QR codes
        const QRy = Math.round(this.height/2);//center y for QR codes
        //Draw helpful numbers
        ctx.font = '15pt Calibri';
        drawTxtWithBg(QRx-spc/2-sQR/2, QRy-spc*1.5-sQR-12, "1", ctx, "#FFFFFF", txtBg);
        drawTxtWithBg(QRx+spc/2+sQR/2, QRy-spc*1.5-sQR-12, "2", ctx, "#FFFFFF", txtBg);
        drawTxtWithBg(QRx-spc/2-sQR/2, QRy+spc*1.5+sQR+12, "3", ctx, "#FFFFFF", txtBg);
        drawTxtWithBg(QRx+spc/2+sQR/2, QRy+spc*1.5+sQR+12, "4", ctx, "#FFFFFF", txtBg);
        //Draw white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(QRx-sQR-spc*1.5, QRy-sQR-spc*1.5, sQR*2+spc*3, sQR*2+spc*3);
        //Draw side decorations to main canvas
        ctx.fillStyle = ctx.createPattern(bgCanvas, "repeat");
        ctx.fillRect(QRx-sQR-spc*1.5-3, QRy-sQR-spc*1.5, 3, sQR*2+spc*3);
        ctx.fillRect(QRx+sQR+spc*1.5,   QRy-sQR-spc*1.5, 3, sQR*2+spc*3);

        qrToCanvas(codes[0], QRx-spc/2-sQR, QRy-spc/2-sQR);
        qrToCanvas(codes[1], QRx+spc/2, QRy-spc/2-sQR);
        qrToCanvas(codes[2], QRx-spc/2-sQR, QRy+spc/2);
        qrToCanvas(codes[3], QRx+spc/2, QRy+spc/2);
      }else{
        const spc = 8;//spacing
        const QRx = Math.round(this.width*0.75);//center x for QR codes
        const QRy = Math.round(this.height/2);//center y for QR codes
        //Draw white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(QRx-sQR/2-spc/2, QRy-sQR/2-spc/2, sQR+spc, sQR+spc);
        //Draw side decorations to main canvas
        ctx.fillStyle = ctx.createPattern(bgCanvas, "repeat");
        ctx.fillRect(QRx-sQR/2-spc/2-3, QRy-sQR/2-spc/2, 3, sQR+spc);
        ctx.fillRect(QRx+sQR/2+spc/2,   QRy-sQR/2-spc/2, 3, sQR+spc);

        qrToCanvas(codes[0], QRx-sQR/2, QRy-sQR/2);
      }
    }
  },
  mounted: function() {
    if (this.pattern){draw(pattern);}
  },
}
</script>

<style scoped>
.editor {
  user-select: none;
}
</style>
