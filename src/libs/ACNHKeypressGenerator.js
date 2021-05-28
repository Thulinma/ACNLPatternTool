import DrawingTool, { RenderTarget} from "@/libs/DrawingTool";
import ACNHFormat from "@/libs/ACNHFormat";

async function generateACNHKeypresses(newData){
  let drawingTool = new DrawingTool(newData);

  const tInfo = drawingTool.typeInfo;
  const bytes = drawingTool.toBytes();

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

  let autoscript = "nohold\n";
  autoscript += "left;3000\nup;3000\nl;4000;position reset\n"; //go to top left pixel, select first palette color
  autoscript += "x;100\n{};100\nup;100\n{};100\nright;100\n{};100\na;100\n{};100;color editor open\n";//open side menu, navigate to color editor


  for (let i = 0; i < 15; ++i){
    if (drawingTool.countPixelsWithColor(i) > 0){
      const slrs = ACNHFormat.colorToSliders(palette[i]);
      if (slrs[0] <= 14){
        autoscript += "left;2000\n{};100\n";
        for (let j = 0; j < slrs[0]; ++j){
          autoscript += "right;50\n{};50\n";
        }
      }else{
        autoscript += "right;2000\n{};100\n";
        for (let j = 0; j < 29-slrs[0]; ++j){
          autoscript += "left;50\n{};50\n";
        }
      }
      autoscript += "minus;50;hue "+(i+1)+" set\n";

      autoscript += "down;100\n{};100\n";//move to next
      if (slrs[1] <= 7){
        autoscript += "left;2000\n{};100\n";
        for (let j = 0; j < slrs[1]; ++j){
          autoscript += "right;50\n{};50\n";
        }
      }else{
        autoscript += "right;2000\n{};100\n";
        for (let j = 0; j < 14-slrs[1]; ++j){
          autoscript += "left;50\n{};50\n";
        }
      }
      autoscript += "minus;50;vivid "+(i+1)+" set\n";

      autoscript += "down;100\n{};100\n";//move to next
      if (slrs[2] <= 7){
        autoscript += "left;2000\n{};100\n";
        for (let j = 0; j < slrs[2]; ++j){
          autoscript += "right;50\n{};50\n";
        }
      }else{
        autoscript += "right;2000\n{};100\n";
        for (let j = 0; j < 14-slrs[2]; ++j){
          autoscript += "left;50\n{};50\n";
        }
      }
      autoscript += "minus;50;bright "+(i+1)+" set\n";
      autoscript += "down;100\nr;50\n{};50;select color "+(i+1)+"\n";
      curCol = i+1;
    }
  }
  autoscript += "a;100\n{};500\nx;100\n{};200;colors all set\n";
  let curCol = 0;
  autoscript += "l;2000\n{};100\n";
  let mt = 50;
  let goingRight = true;
  let msg = "";
  for (let y = 0; y < 32; ++y){
    for (let x = 0; x < 32; ++x){
      let nextCol = drawingTool.getPixel(goingRight?x:31-x, y);
      if (nextCol != curCol){
        //Switch color
        while (curCol < nextCol){
          autoscript += "r;"+mt+"\n{};"+mt+"\n";
          curCol++;
        }
        while (curCol > nextCol){
          autoscript += "l;"+mt+"\n{};"+mt+"\n";
          curCol--;
        }
      }
      let newMsg = Math.round((y*32+x)*100/(32*32))+"% complete";
      if (msg != newMsg){
        msg = newMsg;
        autoscript += "a;"+mt+"\n{};"+mt+";"+msg+"\n";
      }else{
        autoscript += "a;"+mt+"\n{};"+mt+"\n";
      }
      if (goingRight){
        autoscript += "right;"+mt+"\n{};"+mt+"\n";
      }else{
        autoscript += "left;"+mt+"\n{};"+mt+"\n";
      }
    }
    if (y < 31){autoscript += "down;"+mt+"\n{};"+mt+";moved to row "+(y+1)+"\n";}
    goingRight = !goingRight;
  }

  return autoscript;
}

export default generateACNHKeypresses;

