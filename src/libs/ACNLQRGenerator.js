import DrawingTool from "~/libs/DrawingTool";
import ACNHFormat from '~/libs/ACNHFormat';
import { QRCodeEncoder, QRCodeDecoderErrorCorrectionLevel, EncodeHintType } from '@zxing/library';
import {drawPreviewFromTool} from "~/libs/Preview3D";

async function generateACNLQR(newData){
  //Load pattern, prepare render canvas
  let drawingTool = new DrawingTool(newData);

  if (drawingTool.pattern instanceof ACNHFormat){
    console.log("Forcing pattern format to ACNL for QR code generation");
    drawingTool.compatMode = "ACNL";
  }

  drawingTool.fixIssues();
  const tInfo = drawingTool.typeInfo;
  const bytes = drawingTool.toBytes();
  const qrCanvas = document.createElement("canvas");
  let width = 440;
  let height = 270;

  //Update internal canvas size to width/height
  //Only happens right before redraw
  if (bytes.byteLength > 620){
    width = 760;
    height = 460;
  }
  qrCanvas.width = width;
  qrCanvas.height = height;

  let ctx = qrCanvas.getContext('2d');

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
    codes.push(QRCodeEncoder.encode(new Uint8Array(bytes, 0, 620), QRCodeDecoderErrorCorrectionLevel.M, null));
  }

  //Calculate sizes for various bits
  const spc = 8;
  let sQR = 0;
  codes.forEach((c) => {if (c.getMatrix().getWidth()*2 > sQR){sQR = c.getMatrix().getWidth()*2;}});
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

  const pattHeight = height - 60;
  await drawPreviewFromTool(ctx, drawingTool, 0, (height-pattHeight)/2, width-qrWidth, pattHeight);

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
    drawTxtWithBg(pattCenter, (height-pattHeight)/4+4, drawingTool.title, "#FFFFFF");
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

