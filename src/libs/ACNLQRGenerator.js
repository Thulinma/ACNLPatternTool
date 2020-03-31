import DrawingTool from "/libs/DrawingTool";
import logger from "/utils/logger";

//For QR generation
import { QRCodeEncoder, QRCodeDecoderErrorCorrectionLevel, EncodeHintType } from '@zxing/library';

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
import injected from "/utils/injected";


async function generateACNLQR(newData){
  //Load pattern, prepare render canvas
  const drawingTool = (newData instanceof DrawingTool) ? newData : new DrawingTool(newData);
  drawingTool.fixIssues();
  const tInfo = drawingTool.typeInfo;
  const bytes = drawingTool.toBytes();
  const renderCanvas = document.createElement("canvas");
  renderCanvas.width = tInfo.size;
  renderCanvas.height = tInfo.size;
  drawingTool.addCanvas(renderCanvas);
  const qrCanvas = document.createElement("canvas");
  const textureCanvas = document.createElement("canvas");
  let width = 440;
  let height = 270;
  //Check if we should 3D render or not
  let path3D;
  switch (drawingTool.patternType){
    case 0: path3D = injected.dress_long; break;
    case 1: path3D = injected.dress_half; break;
    case 2: path3D = injected.dress_none; break;
    case 3: path3D = injected.shirt_long; break;
    case 4: path3D = injected.shirt_half; break;
    case 5: path3D = injected.shirt_none; break;
  }
  if (path3D){
    //We need to 3D render!
    textureCanvas.width = 128;
    textureCanvas.height = 512;
    drawingTool.addCanvas(textureCanvas, {tall:true});
    drawingTool.render();
    textureCanvas.getContext("2d").clearRect(0, 0, 128, 1);
  }else{
    drawingTool.render();
  }

  //Update internal canvas size to width/height
  //Only happens right before redraw
  if (drawingTool.width > 32){
    width = 760;
    height = 460;
  }
  qrCanvas.width = width;
  qrCanvas.height = height;
  //Ensure blitted images are not smoothed ( = keep pixel look!)
  let ctx = qrCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;


  //Create QR code(s) in memory
  let codes = [];
  if (tInfo.size > 32){
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
    codes.push(QRCodeEncoder.encode(new Uint8Array(bytes, 0, 620), QRCodeDecoderErrorCorrectionLevel.M, null));
  }

  //Calculate sizes for various bits
  const spc = 8;
  let sQR = 0;
  codes.forEach((c) => {if (c.getMatrix().getWidth()*2 > sQR){sQR = c.getMatrix().getWidth()*2;}});
  let pattHeight = 0; //is calculated later
  let sPw = tInfo.size;//default pattern width
  let sPh = tInfo.size;//default pattern height
  if (tInfo.sections instanceof Array){//If we have a simple pattern type, take the custom width/height from it
    sPw = tInfo.sections[2];//custom width
    sPh = tInfo.sections[3];//custom height
  }
  let qrWidth = (sQR+spc*4)*2-6;
  if (bytes.byteLength <= 620){qrWidth = width/2;}
  const pattCenter = (width - qrWidth)/2;


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
  ctx.fillRect(0, 0, width, height);

  //Draw the pattern itself to canvas
  if (!path3D){
    const pattSize = Math.floor((height-60)/sPh);
    pattHeight = pattSize*sPh;
    ctx.drawImage(renderCanvas, 0, 0, sPw, sPh, pattCenter-(sPw*pattSize)/2, (height-pattHeight)/2, pattSize*sPw, pattHeight);
  }else{
    pattHeight = height-60;
    //3D render!
    const threeCanvas = document.createElement("canvas");
    threeCanvas.width = width;
    threeCanvas.height = pattHeight/2;
    const renderer = new WebGLRenderer({alpha:true, canvas:threeCanvas, antialias:true});
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, threeCanvas.width/threeCanvas.height, 0.1, 1000);
    let model = false;
    renderer.setClearColor( 0x000000, 0 );
    let texture = new Texture(textureCanvas)
    texture.needsUpdate = true;
    texture.encoding = sRGBEncoding;
    texture.flipY = false;
    texture.magFilter = NearestFilter;
    const texMat = new MeshBasicMaterial({map:texture});
    const loadModel = (x) => {return new Promise(resolve => {
      let loader = new GLTFLoader();
      loader.parse(JSON.stringify(x), "", (gltf) => {resolve(gltf);});
    });};
    const gltf = await loadModel(path3D);
    model = gltf.scene.children[0];
    model.traverse((child) => {
      if (child instanceof Mesh){child.material = texMat;}
    });
    scene.add(model);
    camera.position.z = 15;
    camera.position.y = 25;
    camera.rotation.x = 5.85;
    renderer.render(scene, camera);
    ctx.drawImage(threeCanvas, 0, 0, threeCanvas.width, threeCanvas.height, pattCenter-width/2, (height-pattHeight)/2, threeCanvas.width, threeCanvas.height);
    model.rotation.y = Math.PI;
    renderer.render(scene, camera);
    ctx.drawImage(threeCanvas, 0, 0, threeCanvas.width, threeCanvas.height, pattCenter-width/2, (height-pattHeight)/2+threeCanvas.height, threeCanvas.width, threeCanvas.height);
    //Free ThreeJS-related resources
    scene.dispose();
    texMat.dispose();
    texture.dispose();
    renderer.dispose();
  }

  //Prepare background pattern for text
  bgCanvas.width=1;
  bgCanvas.height=2;
  bgCtx.fillStyle = "#792e58";
  bgCtx.fillRect(0, 0, 1, 1);
  bgCtx.fillStyle = "#883e5f";
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

  if (bytes.byteLength > 620){
    ctx.font = '15pt Calibri';
    drawTxtWithBg(pattCenter, (height-pattHeight)/4+(path3D?4:0), drawingTool.title, "#FFFFFF");
    ctx.font = '10pt Calibri';
    drawTxtWithBg(pattCenter, height-(height-pattHeight)/4, "By "+drawingTool.creator[0] + " from "+drawingTool.town[0], "#FFFFFF");
  }
  else {
    ctx.font = '15pt Calibri';
    drawTxtWithBg(width/2, (height-pattHeight)/4-2, drawingTool.title, "#FFFFFF");
    ctx.font = '10pt Calibri';
    drawTxtWithBg(width/2, height-2-(height-pattHeight)/4, "By "+drawingTool.creator[0] + " from "+drawingTool.town[0], "#FFFFFF");
  }

  //Prepare pretty side decoration
  bgCanvas.width=3;
  bgCanvas.height=6;
  bgCtx.fillStyle = "#FFFFFF";
  bgCtx.fillRect(0, 0, 3, 6);
  bgCtx.fillStyle = "#c7b98c";
  bgCtx.fillRect(0.5, 0, 2, 4);
  const borderDeco = ctx.createPattern(bgCanvas, "repeat")

  //Draws the passed QRCode with top left corner on the x/y location.
  //We access the encoder directly and use a custom drawing implementation, because going through a SVG is blergh.
  const qrToCanvas = (QR, x, y) => {
    const pixelSize = 2;
    const input = QR.getMatrix();
    const qrSize = input.getWidth();//We assume width==height. It should be...
    //Draw white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x-spc, y-spc, qrSize*pixelSize+2*spc, qrSize*pixelSize+2*spc);
    //Draw border decorations
    ctx.fillStyle = borderDeco;
    ctx.fillRect(x-3-spc, y-spc, 3, qrSize*pixelSize+2*spc);
    ctx.fillRect(x+qrSize*pixelSize+spc, y-spc, 3, qrSize*pixelSize+2*spc);
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


  //Write QR code to canvas
  if (bytes.byteLength > 620){
    const QRx = width - (sQR+spc*4);//center x for QR codes
    const QRy = Math.round(height/2);//center y for QR codes
    qrToCanvas(codes[0], QRx-spc*2-sQR, QRy-spc*2-sQR);
    qrToCanvas(codes[1], QRx+spc*2,     QRy-spc*2-sQR);
    qrToCanvas(codes[2], QRx-spc*2-sQR, QRy+spc*2);
    qrToCanvas(codes[3], QRx+spc*2,     QRy+spc*2);
    //Draw helpful numbers
    ctx.font = '15pt Calibri';
    drawTxtWithBg(QRx-spc*2-sQR/2, QRy-spc*2-sQR-22, "1", "#FFFFFF");
    drawTxtWithBg(QRx+spc*2+sQR/2, QRy-spc*2-sQR-22, "2", "#FFFFFF");
    drawTxtWithBg(QRx-spc*2-sQR/2, QRy+spc*2+sQR+22, "3", "#FFFFFF");
    drawTxtWithBg(QRx+spc*2+sQR/2, QRy+spc*2+sQR+22, "4", "#FFFFFF");
  }else{
    const QRx = Math.round(width*0.75);//center x for QR codes
    const QRy = Math.round(height/2);//center y for QR codes
    qrToCanvas(codes[0], QRx-sQR/2, QRy-sQR/2);
  }
  return qrCanvas.toDataURL("image/png");
}

export default generateACNLQR;

