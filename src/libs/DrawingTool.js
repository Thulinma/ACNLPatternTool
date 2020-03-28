import ACNLFormat from '/libs/ACNLFormat';
import ACNHFormat from '/libs/ACNHFormat';
import lzString from 'lz-string';

class RenderTarget{
  //Valid options for RenderTargets:
  // - tall: If true, will assume 1x4 layout for 3D texture use
  // - grid: If true, will draw a pixel grid on top
  constructor(c, opt = {}){
    this.canvas = c;
    this.context = c.getContext("2d");
    this.opt = opt;
  }

  get width(){return this.canvas.width;}
  get height(){return this.canvas.height;}

  /// Calculates the correct zoom level, given the current pattern width
  /// Should be called every time the pattern (or canvas) changes width
  calcZoom(pWidth){
    this.context.imageSmoothingEnabled = false;
    if (this.opt.tall){
      this.zoom = this.width/32;
    }else if (this.width < this.height){
      this.zoom = Math.floor(this.width / pWidth);
    }else{
      this.zoom = Math.floor(this.height / pWidth);
    }
  }

  /// Draws the given pixel with the given HTML color
  drawPixel(x, y, color){
    //If we've gone under 64 pixels, assume we meant the right side instead.
    if (y > 63 && !this.opt.tall){
      y -= 64; x += 32;
    }
    //draw the pixel
    if (color.length){
      this.context.fillStyle = color;
      this.context.fillRect(x*this.zoom,y*this.zoom,this.zoom,this.zoom);
    }else{
      this.context.clearRect(x*this.zoom,y*this.zoom,this.zoom,this.zoom);
    }
    //if zoom > 5, draw a line
    if (this.opt.grid){
      if (x % 16 == 15){
        this.context.fillStyle = "#AA0000";
      }else{
        this.context.fillStyle = "#AAAAAA";
      }
      this.context.fillRect(x*this.zoom+this.zoom-((x%8==7)?2:1),y*this.zoom,(x%8==7)?2:1,this.zoom);
      if (y % 16 == 15){
        this.context.fillStyle = "#BB0000";
      }else{
        this.context.fillStyle = "#AAAAAA";
      }
      this.context.fillRect(x*this.zoom,y*this.zoom+this.zoom-((y%8==7)?2:1),this.zoom,(y%8==7)?2:1);
    }
    if (typeof this.opt.drawCallback == "function"){this.opt.drawCallback();}
  }

  /// Renders a whole image by copying from another RenderTarget (must be grid-less).
  /// Draws grid on top if needed.
  blitFrom(c){
    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    if (this.opt.tall){
      this.context.drawImage(c.canvas, 0, 0, c.canvas.width/2, c.canvas.height, 0, 0, this.canvas.width, this.canvas.height/2);
      this.context.drawImage(c.canvas, c.canvas.width/2, 0, c.canvas.width/2, c.canvas.height, 0, this.canvas.height/2, this.canvas.width, this.canvas.height/2);
    }else{
      this.context.drawImage(c.canvas, 0, 0, c.canvas.width, c.canvas.height, 0, 0, this.canvas.width, this.canvas.height)
    }
    if (this.opt.grid){
      for (let x = 0; x < this.canvas.width/this.zoom; ++x){
        if (x % 16 == 15){
          this.context.fillStyle = "#AA0000";
        }else{
          this.context.fillStyle = "#AAAAAA";
        }
        this.context.fillRect((x+1)*this.zoom-((x%8==7)?2:1),0,(x%8==7)?2:1,this.canvas.height);
      }
      for (let y = 0; y < this.canvas.height/this.zoom; ++y){
        if (y % 16 == 15){
          this.context.fillStyle = "#BB0000";
        }else{
          this.context.fillStyle = "#AAAAAA";
        }
        this.context.fillRect(0,(y+1)*this.zoom-((y%8==7)?2:1),this.canvas.width,(y%8==7)?2:1);
      }
    }
    if (typeof this.opt.drawCallback == "function"){this.opt.drawCallback();}
  }
};

// Fallback drawing handler, when none is set.
function basicDrawing(x, y, tool){tool.drawPixel(x, y);}

class DrawingTool{
  constructor(data = null){
    this.renderTargets = []; //TODO: Should this be a map, perhaps? How do maps work in JS? Can we de-duplicate..?
    this.drawing = false;
    this.handleOnLoad = [() => {this.render(); this.pushUndo();}];//setup default onLoad handler
    this.handleColorChange = [];
    this.reset();
    this.undoHistory = [];
    this.redoHistory = [];
    if (data != null){this.load(data);}
  }

  ///Clears all data (except render targets and onLoad handlers) to defaults
  reset(){
    this.pattern = new ACNLFormat();
    this.pixels_buffer = new ArrayBuffer(4096);
    this.pixels = new Uint8Array(this.pixels_buffer);
    this.drawHandler = basicDrawing;
    this.drawHandlerAlt = basicDrawing;
    this.currentColor = 0;
    this.undoHistory = [];
    this.redoHistory = [];
    this.onLoad();
  }

  load(data){
    if ((typeof data) == "string" && data.startsWith("LZ|")){
      this.pattern = new ACNLFormat(lzString.decompressFromBase64(data.substr(3)));
    }else if ((typeof data) == "string" && data.startsWith("B6|")){
      this.pattern = new ACNLFormat(atob(data.substr(3)));
    }else if (data instanceof DrawingTool){
      this.pattern = data.pattern;
    }else if (data instanceof Uint8Array){
      if (data.byteLength == 2216 || data.byteLength == 680){
        this.pattern = new ACNHFormat(data);
      }else{
        this.pattern = new ACNLFormat(data);
      }
    }else{
      this.pattern = new ACNLFormat(data);
    }
    this.pixels_buffer = new ArrayBuffer(4096);
    this.pixels = new Uint8Array(this.pixels_buffer);
    this.pattern.toPixels(this.pixels);
    this.currentColor = 0;
    this.onLoad();
    this.onColorChange();
  }

  pushUndo(){
    let currPal = [];
    for (let i = 0; i < 15; ++i){currPal.push(this.pattern.getPalette(i));}
    this.undoHistory.push({pixels: new Uint8Array(this.pixels), palette: currPal});
    if (this.undoHistory.length > 25){this.undoHistory.splice(1, this.undoHistory.length-25);}
  }

  pushRedo(){
    let currPal = [];
    for (let i = 0; i < 15; ++i){currPal.push(this.pattern.getPalette(i));}
    this.redoHistory.push({pixels: new Uint8Array(this.pixels), palette: currPal});
    if (this.redoHistory.length > 25){this.redoHistory.splice(1, this.redoHistory.length-25);}
  }

  undo(){
    if (!this.undoHistory.length){return false};
    this.pushRedo();
    let pState = this.undoHistory.pop();
    for (let i = 0; i < 4096; ++i){this.pixels[i] = pState.pixels[i];}
    for (let i = 0; i < 15; ++i){this.pattern.setPalette(i, pState.palette[i]);}
    this.onColorChange();
    this.render();
    return true;
  }
  
  redo(){
    if (!this.redoHistory.length){return false};
    this.pushUndo();
    let pState = this.redoHistory.pop();
    for (let i = 0; i < 4096; ++i){this.pixels[i] = pState.pixels[i];}
    for (let i = 0; i < 15; ++i){this.pattern.setPalette(i, pState.palette[i]);}
    this.onColorChange();
    this.render();
    return true;
  }
  
  /// Gets this.currentColor translated into a HTML color
  get color(){
    return this.getPalette(this.currentColor);
  }

  /// Sets this.currentColor to the closest option in the palette.
  /// Supports #RRGGBB-style and [r,g,b]-style, or simply passing a current palette index.
  set color(c){
    this.currentColor = this.findPalRGB(c);
  }

  get width(){return this.pattern.width;}
  get height(){return this.pattern.height;}
  get pixelCount(){return this.width*this.height;}
  get fullHash(){return this.pattern.fullHash();}
  get pixelHash(){return this.pattern.pixelHash();}

  get title(){return this.pattern.title;}
  set title(n){this.pattern.title = n;}
  get creator(){return this.pattern.creator;}
  set creator(n){this.pattern.creator = n;}
  get town(){return this.pattern.town;}
  set town(n){this.pattern.town = n;}
  fixIssues(){this.pattern.fixIssues();}
  get authorStrict(){
    let copiedCreator = "";
    for (let i = 0; i < 44; ++i){copiedCreator += String.fromCharCode(this.pattern.dataBytes[0x2A + i]);}
    return copiedCreator;
  }
  set authorStrict(n){
    for (let i = 0; i < 44; ++i){this.pattern.dataBytes[0x2A + i] = n.charCodeAt(i);}
  }
  get patternType(){return this.pattern.patternType;}
  set patternType(n){
    if (this.pattern.patternType != n){
      this.pattern.patternType = n;
      this.pattern.fromPixels(this.pixels);
      this.pattern.toPixels(this.pixels);
      this.onLoad();
    }
  }
  get typeInfo(){
    if (this.pattern instanceof ACNHFormat){
      return ACNHFormat.typeInfo[this.pattern.patternType];
    }
    return ACNLFormat.typeInfo[this.pattern.patternType];
  }
  get allTypes(){
    if (this.pattern instanceof ACNHFormat){
      return ACNHFormat.typeInfo;
    }
    return ACNLFormat.typeInfo;
  }
  
  /// Finds the closest global palette index we can find to the color c
  /// Supports #RRGGBB-style, [r,g,b]-style, or simply passing a global palette index.
  findRGB(c){
    if ((typeof c) == "number"){return c;}
    let rgb = [];
    if ((typeof c) == "string" && c.length == 7){
      rgb = [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
    }
    if (c instanceof Array){rgb = c;}
    if (!rgb.length){
      console.log("Invalid color lookup argument: ", c);
      return 0;
    }
    //Find the closest match
    let best = 255*255*3;
    let bestno = 0;
    for (let i = 0; i < 256; i++){
      let m = ACNLFormat.RGBLookup[i];
      if (m === null){continue;}
      let rD = (m[0] - rgb[0]);
      let gD = (m[1] - rgb[1]);
      let bD = (m[2] - rgb[2]);
      let match = (rD*rD + gD*gD + bD*bD);
      if (match < best){
        if (!match){return i;}//perfect match - we can stop immediately
        best = match;
        bestno = i;
      }
    }
    return bestno;
  }

  /// Finds the closest current palette index we can find to the color c
  /// Supports #RRGGBB-style, [r,g,b]-style, or simply passing a current palette index.
  findPalRGB(c){
    if ((typeof c) == "number"){return c;}
    let rgb = [];
    if ((typeof c) == "string" && c.length == 7){
      rgb = [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
    }
    if (c instanceof Array){rgb = c;}
    //Nothing to check against? Return currently active color instead.
    if (!rgb.length){return this.currentColor;}
    //Find the closest match
    let best = 255*255*3;
    let bestno = 0;
    for (let i = 0; i < 15; i++){
      let m = null;
      if (this.pattern instanceof ACNHFormat){
        m = this.pattern.getPalette(i);
      }else{
        m = ACNLFormat.RGBLookup[this.pattern.getPalette(i)];
      }
      if (m === null){continue;}
      let rD = (m[0] - rgb[0]);
      let gD = (m[1] - rgb[1]);
      let bD = (m[2] - rgb[2]);
      let match = (rD*rD + gD*gD + bD*bD);
      if (match < best){
        if (!match){return i;}//perfect match - we can stop immediately
        best = match;
        bestno = i;
      }
    }
    return bestno;
  }

  /// Finds the closest YUV global palette index we can find to the color c
  /// Supports [r,g,b]-style only.
  findYUV(rgb){
    //Convert to YUV
    let yuv = [rgb[0] *  .299000 + rgb[1] *  .587000 + rgb[2] *  .114000, rgb[0] * -.168736 + rgb[1] * -.331264 + rgb[2] *  .500000 + 128, rgb[0] *  .500000 + rgb[1] * -.418688 + rgb[2] * -.081312 + 128];
    //Find the closest match
    let best = 255*255*3;
    let bestno = 0;
    for (let i = 0; i < 256; i++){
      let m = ACNLFormat.YUVLookup[i];
      if (m === null){continue;}
      let yD = (m[0] - yuv[0]);
      let uD = (m[1] - yuv[1]);
      let vD = (m[2] - yuv[2]);
      let match = (yD*yD + uD*uD + vD*vD);
      if (match < best){
        if (!match){return i;}//perfect match - we can stop immediately
        best = match;
        bestno = i;
      }
    }
    return bestno;
  }

  /// Finds the closest YUV current palette index we can find to the color c
  /// Supports [r,g,b]-style only.
  findPalYUV(rgb){
    //Convert to YUV
    let yuv = [rgb[0] *  .299000 + rgb[1] *  .587000 + rgb[2] *  .114000, rgb[0] * -.168736 + rgb[1] * -.331264 + rgb[2] *  .500000 + 128, rgb[0] *  .500000 + rgb[1] * -.418688 + rgb[2] * -.081312 + 128];
    //Find the closest match
    let best = 255*255*3;
    let bestno = 0;
    for (let i = 0; i < 15; i++){
      let m = ACNLFormat.YUVLookup[this.pattern.getPalette(i)];
      if (m === null){continue;}
      let yD = (m[0] - yuv[0]);
      let uD = (m[1] - yuv[1]);
      let vD = (m[2] - yuv[2]);
      let match = (yD*yD + uD*uD + vD*vD);
      if (match < best){
        if (!match){return i;}//perfect match - we can stop immediately
        best = match;
        bestno = i;
      }
    }
    return bestno;
  }


  ///Sets the given palette index to the closest color we can find to c
  /// Supports #RRGGBB-style, [r,g,b]-style, or simply passing a color palette index.
  setPalette(idx, c){
    if (idx < 0 || idx > 14){return;}//abort for invalid indexes
    if (this.pattern instanceof ACNHFormat){
      let rgb = c;
      if ((typeof c) == "string" && c.length == 7){
        rgb = [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
      }
      this.pattern.setPalette(idx, rgb);
    }
    if (this.pattern instanceof ACNHFormat){this.pattern.setPalette(idx, this.findRGB(c));}
    this.onColorChange();
    this.render();
  }

  /// Returns the HTML color of the given palette index
  getPalette(idx){
    if (idx < 0 || idx > 14){return "#FFFFFF00";}//abort for invalid indexes
    if (this.pattern instanceof ACNHFormat){
      function toHex(n){return (n<16?"0":"")+n.toString(16);}
      const c = this.pattern.getPalette(idx);
      return "#"+toHex(c[0])+toHex(c[1])+toHex(c[2]);
    }
    return ACNLFormat.paletteColors[this.pattern.getPalette(idx)];
  }

  ///Handles a canvas click or mouse move operation
  handleCanvasClick(e){
    let xpos = 0, ypos = 0;
    if (e.offsetX == undefined){
      xpos = e.pageX-e.target.offsetLeft;
      ypos = e.pageY-e.target.offsetTop;
    }else{
      xpos = e.offsetX;
      ypos = e.offsetY;
    }
    let x = Math.floor(xpos / (e.target.width / this.pattern.width));
    let y = Math.floor(ypos / (e.target.height / this.pattern.width));
    if (e.which == 1){this.drawHandler(x, y, this);}
    if (e.which == 3){this.drawHandlerAlt(x, y, this);}
  }

  /// Adds a canvas to the internal list of render targets.
  addCanvas(c, opt = {}){
    let rTarget = new RenderTarget(c, opt);
    rTarget.calcZoom(this.pattern.width);
    if (!opt.tall && !opt.grid && this.renderTargets.length && (this.renderTargets[0].opt.tall || this.renderTargets[0].opt.grid)){
      this.renderTargets.unshift(rTarget);
    } else {
      this.renderTargets.push(rTarget);
    }
    const prevDef = function(e){e.preventDefault();}
    const touchToMouse = function(e){
      const t = e.touches[0];
      const rect = t.target.getBoundingClientRect();
      return {
        offsetX: t.clientX - rect.left,
        offsetY: t.clientY - rect.top,
        which: 1,
        target: t.target
      };
    };
    //In case there's no touch support, ignore
    try{
      c.addEventListener("touchstart", (e) => {
        document.body.addEventListener('touchmove', prevDef, {passive:false});
        this.drawing = true;
        this.pushUndo();
        this.handleCanvasClick(touchToMouse(e));
      });
      c.addEventListener("touchend", () => {
        this.drawing = false;
        document.body.removeEventListener('touchmove', prevDef);
      });
      c.addEventListener("touchmove", (e) => {
        if (this.drawing){this.handleCanvasClick(touchToMouse(e));}
      });
    }catch(e){}
    c.addEventListener("mousedown", () => {
      this.drawing = true;
      this.pushUndo();
    });
    c.addEventListener("mouseup", () => {this.drawing = false;});
    c.addEventListener("mousemove", (e) => {
      if (this.drawing && (e.which == 1 || e.which == 3)){this.handleCanvasClick(e);}}
    );
    c.addEventListener("click", (e) => {this.handleCanvasClick(e);});
    c.addEventListener("contextmenu", (e) => {this.handleCanvasClick(e); e.preventDefault();});
  }

  /// Renders a full image to all internally stored render targets
  /// Does so by first drawing all pixels to the first target, then blitting the first onto the others
  /// This function also recalculates zoom levels
  render(){
    //Abort if there are no render targets
    if (!this.renderTargets.length){return;}

    //Build lookup table of palette colors
    let palette = [];
    for (let i = 0; i < 16; ++i){palette.push(this.getPalette(i));}
    //Render all pixels to the first target
    this.renderTargets[0].calcZoom(this.pattern.width);
    let pixCount = this.pattern.width == 32 ? 1024 : 4096;
    for (let i = 0; i < pixCount; i++){
      let x = (i % 32);
      let y = Math.floor(i / 32);
      if (this.pixels[i] == 0xFC || this.pixels[i] == 15){
        this.renderTargets[0].drawPixel(x, y, "");
      }else{
        this.renderTargets[0].drawPixel(x, y, palette[this.pixels[i]]);
      }
    }
    
    //Finally, copy to all others
    for (let i = 1; i < this.renderTargets.length; ++i){
      this.renderTargets[i].calcZoom(this.pattern.width);
      this.renderTargets[i].blitFrom(this.renderTargets[0]);
    }
  }

  /// Returns the color (palette index) of the given pixel
  getPixel(x, y){
    if (x < 0 || y < 0 || x > 63 || y > 63 || isNaN(x) || isNaN(y)){return false;}
    if (this.pattern.width == 32 && (x > 31 || y > 31)){return false;}
    if (x > 31){
      x -= 32;
      y += 64;
    }
    let offset = x + y*32;
    return this.pixels[offset];
  }

  /// Fills the given pixel with the given color or current drawing color if non-numerical.
  /// Returns the color actually used to set the pixel, or false if there was no change in color
  setPixel(x, y, color = null){
    if ((typeof color) != "number"){
      color = this.findPalRGB(color);
    }
    if (x < 0 || y < 0 || color < 0 || color > 15 || x > 63 || y > 63 || isNaN(x) || isNaN(y)){return false;}
    if (this.pattern.width == 32 && (x > 31 || y > 31)){return false;}
    if (x > 31){
      x -= 32;
      y += 64;
    }
    let offset = x + y*32;
    if (this.pixels[offset] == color || this.pixels[offset] == 0xFC){return false;}
    return this.pixels[offset] = color;
  }

  /// Calls setPixel, then draws said pixel to all canvases if there was any color change.
  drawPixel(x, y, color = null){
    color = this.setPixel(x, y, color);
    if (color === false){return;}
    let htmlColor = this.getPalette(color);
    for (let i in this.renderTargets){
      this.renderTargets[i].drawPixel(x, y, htmlColor);
    }
  }

  /// When called with a function as parameter, adds an event handler for pattern loads.
  /// When called without parameter (or with null), calls all onLoad event handlers in sequence.
  /// Called automatically whenever pattern changes type, when it is reset, or when an entirely new pattern is loaded
  onLoad(f = null){
    if (f === null){
      for (let i in this.handleOnLoad){
        this.handleOnLoad[i](this);
      }
    }else if ((typeof f) == "function"){
      this.handleOnLoad.push(f);
    }
  }

  /// When called with a function as parameter, adds an event handler for color changes.
  /// When called without parameter (or with null), calls all onColorChange event handlers in sequence.
  /// Called automatically whenever colors in the palette change, or a new pattern is loaded.
  onColorChange(f = null){
    if (f === null){
      for (let i in this.handleColorChange){
        this.handleColorChange[i](this);
      }
    }else if ((typeof f) == "function"){
      this.handleColorChange.push(f);
    }
  }

  /// Returns a string that can be QR encoded
  toString(){
    this.pattern.fromPixels(this.pixels);
    return this.pattern.toString();
  }

  /// Returns an ArrayBuffer that can be stored into a file
  toBytes(){
    this.pattern.fromPixels(this.pixels);
    return this.pattern.b;
  }

  /// Returns a JSON object describing the pattern in semi-human-readable terms
  toJSON(){
    return this.pattern.toJSON();
  }

};

export default DrawingTool;

