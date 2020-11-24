import {default as DrawingTool, RenderTarget} from "~/libs/DrawingTool";
import ACNHFormat from '~/libs/ACNHFormat';
import {drawPreviewFromTool} from "~/libs/Preview3D";

async function generateACNHPBL(newData){
  //Load pattern, prepare render canvas
  let drawingTool = new DrawingTool(newData);

  const tInfo = drawingTool.typeInfo;
  const bytes = drawingTool.toBytes();
  const pblCanvas = document.createElement("canvas");
  let width = 862;
  let height = 660;
  pblCanvas.width = width;
  pblCanvas.height = height;
  let ctx = pblCanvas.getContext('2d');

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

  //Build lookup table of palette colors
  let palette = [];
  for (let i = 0; i < 16; ++i){
    const slrs = ACNHFormat.colorToSliders(drawingTool.getPalette(i));
    //Quantify to nearest slider position
    const hex = ACNHFormat.slidersToColor(slrs[0], slrs[1], slrs[2]);
    drawingTool.setPalette(i, hex);
  }
  drawingTool.dedupeColors();
  drawingTool.sortColors();
  for (let i = 0; i < 16; ++i){
    palette.push(drawingTool.getPalette(i));
  }

  //Draw PBL grid
  {
    const gridCanvas = document.createElement("canvas");
    gridCanvas.width = 640;
    gridCanvas.height = 640;
    const texW = drawingTool.texWidth;
    const r = new RenderTarget(gridCanvas, {tool:drawingTool, grid:true, pbn:true});
    r.calcZoom(texW, texW);
    drawingTool.renderToTarget(r, palette);
    ctx.drawImage(gridCanvas, 10, 10);
  }

  //Draw preview image
  try{
    await drawPreviewFromTool(ctx, drawingTool, 660, 10, 192, 192);
  }catch(e){
    console.log(e);
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
    ctx.textBaseline = "middle";
    ctx.textAlign = 'center';
    ctx.font = '20px Calibri';
    const txtProps = ctx.measureText(txt);
    var h = (txtProps.fontBoundingBoxAscent?txtProps.fontBoundingBoxAscent:txtProps.actualBoundingBoxAscent) + (txtProps.fontBoundingBoxDescent?txtProps.fontBoundingBoxDescent:txtProps.actualBoundingBoxDescent)+4;
    var w = txtProps.width-h/2;
    x += w/2;
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
  };

  const drawLetter = (x, y, c, colIndex) => {
      let lightness = parseInt(c.substr(1, 2), 16) * 0.299 + parseInt(c.substr(3, 2), 16) * 0.587 + parseInt(c.substr(5, 2), 16) * 0.114;
      if (lightness > 120){ctx.fillStyle = "#000000";}else{ctx.fillStyle = "#FFFFFF";}
      ctx.fillRect(x-1, y-1, 22, 22);

      ctx.fillStyle = c;
      ctx.fillRect(x, y, 20, 20);
      ctx.font = "20px monospace";

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (lightness > 120){ctx.fillStyle = "#000000";}else{ctx.fillStyle = "#FFFFFF";}
      ctx.fillText(String.fromCharCode(65+colIndex), x+10, y+11);
  };

  //Write slider positions
  for (let i = 0; i < 15; ++i){
    if (drawingTool.countPixelsWithColor(i) > 0){
      drawLetter(660, 212+((630-212)/14*i), palette[i], i);
      const slrs = ACNHFormat.colorToSliders(palette[i]);
      drawTxtWithBg(660+35, 212+((630-212)/14*i)+10, (slrs[0]+1)+", "+(slrs[1]+1)+", "+(slrs[2]+1), "#FFFFFF");
    }
  }

  return pblCanvas.toDataURL("image/png");
}

export default generateACNHPBL;

