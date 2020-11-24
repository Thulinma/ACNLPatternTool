import ACNLFormat from '~/libs/ACNLFormat';
import ACNHFormat from '~/libs/ACNHFormat';
import { ResizeObserver } from "@juggle/resize-observer";
import lzString from 'lz-string';

class RenderTarget{
  //Valid options for RenderTargets:
  // - tall: If true, will assume 1x4 layout for 3D texture use
  // - grid: If true, will draw a pixel grid on top
  // - pbn: If true, will draw Paint-By-Numbers style letters on top of pixels
  constructor(c, opt = {}){
    this.canvas = c;
    this.context = c.getContext("2d");
    this.opt = opt;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    if (!opt.texture){
      const ro = new ResizeObserver(entries => this.resizeHandler(entries));
      ro.observe(c);
    }
  }

  
  resizeHandler(entries){
    for (let entry of entries) {
      this.canvas.width = Math.floor(entry.contentRect.width / 64)*64;
      this.canvas.height = Math.floor(entry.contentRect.height / 64)*64;
      if (this.canvas.width < 64){this.canvas.width = 64;}
      if (this.canvas.height < 64){this.canvas.height = 64;}
      //recalculate zoom level
      this.calcZoom();
      //re-render
      this.opt.tool.render();
    }
  }

  /// Calculates the correct zoom level, given the current pattern width
  /// Should be called every time the pattern (or canvas) changes width
  calcZoom(pWidth, tWidth){
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    if (pWidth && tWidth){
      if (this.opt.texture){
        pWidth = tWidth;
      }
      this.pWidth = pWidth;
      this.tWidth = tWidth;
    }
    this.context.imageSmoothingEnabled = false;
    if (this.opt.tall){
      this.zoom = this.width/32;
    }else{
      if (this.width < this.pWidth){
        this.width = this.pWidth;
        this.canvas.width = this.width;
      }
      if (this.height < this.pWidth){
        this.height = this.pWidth;
        this.canvas.height = this.height;
      }
      if (this.width < this.height){
        this.zoom = Math.floor(this.width / this.pWidth);
      }else{
        this.zoom = Math.floor(this.height / this.pWidth);
      }
    }
  }

  /// Draws the given pixel with the given HTML color
  drawPixel(x, y, color, colIndex){
    //If we've gone under 64 pixels, assume we meant the right side instead.
    if (y > 63){
      y -= 64; x += 32;
    }
    //draw the pixel
    if (color.length){
      this.context.fillStyle = color;
      this.context.fillRect(x*this.zoom,y*this.zoom,this.zoom,this.zoom);
    }else{
      this.context.clearRect(x*this.zoom,y*this.zoom,this.zoom,this.zoom);
    }
    //if a grid is wanted, draw one
    if (this.opt.grid){
      if (x % 16 == 15 && x != this.tWidth-1){
        this.context.fillStyle = "#AA0000";
      }else{
        this.context.fillStyle = "#AAAAAA";
      }
      this.context.fillRect(x*this.zoom+this.zoom-((x%8==7)?2:1),y*this.zoom,(x%8==7)?2:1,this.zoom);
      if (y % 16 == 15 && y != this.tWidth-1){
        this.context.fillStyle = "#BB0000";
      }else{
        this.context.fillStyle = "#AAAAAA";
      }
      this.context.fillRect(x*this.zoom,y*this.zoom+this.zoom-((y%8==7)?2:1),this.zoom,(y%8==7)?2:1);
    }
    if (this.opt.pbn && color.length){
      this.context.font = this.zoom+"px monospace";

      let lightness = parseInt(color.substr(1, 2), 16) * 0.299 + parseInt(color.substr(3, 2), 16) * 0.587 + parseInt(color.substr(5, 2), 16) * 0.114;
      if (lightness > 120){
        this.context.fillStyle = "#000000";
      }else{
        this.context.fillStyle = "#FFFFFF";
      }

      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.fillText(String.fromCharCode(65+colIndex), (x+0.5)*this.zoom, (y+0.5)*this.zoom);
    }
  }

  drawCallback(){
    if (typeof this.opt.drawCallback == "function"){this.opt.drawCallback();}
  }

  /// Renders a whole image by copying from another RenderTarget (must be grid-less).
  /// Draws grid on top if needed.
  blitFrom(c){
    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    if (this.opt.tall){
      this.context.drawImage(c.canvas, 0, 0, c.canvas.width/2, c.canvas.height, 0, 0, this.canvas.width, this.canvas.height/2);
      this.context.drawImage(c.canvas, c.canvas.width/2, 0, c.canvas.width/2, c.canvas.height, 0, this.canvas.height/2, this.canvas.width, this.canvas.height/2);
    } else {
      this.context.drawImage(c.canvas, 0, 0, c.canvas.width, c.canvas.height, 0, 0, c.canvas.width/(c.zoom/this.zoom), c.canvas.height/(c.zoom/this.zoom))
    }
    if (this.opt.grid){
      for (let x = 0; x < this.canvas.width/this.zoom; ++x){
        if (x % 16 == 15 && x != this.tWidth-1){
          this.context.fillStyle = "#AA0000";
        }else{
          this.context.fillStyle = "#AAAAAA";
        }
        this.context.fillRect((x+1)*this.zoom-((x%8==7)?2:1),0,(x%8==7)?2:1,this.canvas.height);
      }
      for (let y = 0; y < this.canvas.height/this.zoom; ++y){
        if (y % 16 == 15 && y != this.tWidth-1){
          this.context.fillStyle = "#BB0000";
        }else{
          this.context.fillStyle = "#AAAAAA";
        }
        this.context.fillRect(0,(y+1)*this.zoom-((y%8==7)?2:1),this.canvas.width,(y%8==7)?2:1);
      }
    }
    this.drawCallback();
  }
};

// Fallback drawing handler, when none is set.
function basicDrawing(x, y, tool){tool.drawPixel(x, y);}

//number to hex helper function
function toHex(n){return (n<16?"0":"")+n.toString(16);}

class DrawingTool{
  constructor(data = null){
    this.renderTargets = []; //TODO: Should this be a map, perhaps? How do maps work in JS? Can we de-duplicate..?
    this.drawing = false;
    this.handleOnLoad = [() => {this.render(); this.pushUndo();}];//setup default onLoad handler
    this.handleColorChange = [];
    this.reset();
    this.undoHistory = [];
    this.redoHistory = [];
    this.xbrz = true;
    if (data instanceof DrawingTool){
      this.load(data.toString());
    }else{
      if (data != null){this.load(data);}
    }
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
      let str = lzString.decompressFromBase64(data.substr(3));
      if (str.length == 2216 || str.length == 680){
        this.pattern = new ACNHFormat(str);
      }else{
        this.pattern = new ACNLFormat(str);
      }
    }else if ((typeof data) == "string" && data.startsWith("B6|")){
      let str = atob(data.substr(3));
      if (str.length == 2216 || str.length == 680){
        this.pattern = new ACNHFormat(str);
      }else{
        this.pattern = new ACNLFormat(str);
      }
    }else if (data instanceof DrawingTool){
      this.pattern = data.pattern;
    }else if (data instanceof Uint8Array){
      if (data.byteLength == 2216 || data.byteLength == 680){
        this.pattern = new ACNHFormat(data);
      }else{
        this.pattern = new ACNLFormat(data);
      }
    }else{
      if (data.length == 2216 || data.length == 680){
        this.pattern = new ACNHFormat(data);
      }else{
        this.pattern = new ACNLFormat(data);
      }
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
    for (let i = 0; i < 15; ++i){currPal.push(this.getPalette(i));}
    this.undoHistory.push({pixels: new Uint8Array(this.pixels), palette: currPal});
    if (this.undoHistory.length > 25){this.undoHistory.splice(1, this.undoHistory.length-25);}
  }

  pushRedo(){
    let currPal = [];
    for (let i = 0; i < 15; ++i){currPal.push(this.getPalette(i));}
    this.redoHistory.push({pixels: new Uint8Array(this.pixels), palette: currPal});
    if (this.redoHistory.length > 25){this.redoHistory.splice(1, this.redoHistory.length-25);}
  }

  undo(){
    if (!this.undoHistory.length){return false};
    this.pushRedo();
    let pState = this.undoHistory.pop();
    for (let i = 0; i < 4096; ++i){this.pixels[i] = pState.pixels[i];}
    for (let i = 0; i < 15; ++i){this.setPalette(i, pState.palette[i]);}
    this.onColorChange();
    this.render();
    return true;
  }

  redo(){
    if (!this.redoHistory.length){return false};
    this.pushUndo();
    let pState = this.redoHistory.pop();
    for (let i = 0; i < 4096; ++i){this.pixels[i] = pState.pixels[i];}
    for (let i = 0; i < 15; ++i){this.setPalette(i, pState.palette[i]);}
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
  get texWidth(){return this.pattern.texWidth;}
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
      let oldWidth = this.width;
      this.pattern.patternType = n;
      if (oldWidth < this.width){
        //Copy the first 32x32 to the others
        for (let pix = 0; pix < 1024; ++pix){
          this.pixels[pix+1024] = this.pixels[pix];
          this.pixels[pix+1024*2] = this.pixels[pix];
          this.pixels[pix+1024*3] = this.pixels[pix];
        }
      }
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
  get compatMode(){
    if (this.pattern instanceof ACNLFormat){return "ACNL";}
    if (this.pattern instanceof ACNHFormat){return "ACNH";}
    return "????";
  }
  set compatMode(n){
    if (this.compatMode == n){return;}//No change
    const tmpMode = this.compatMode;
    const tmpType = this.patternType;
    const tmpTitle = this.title;
    const tmpAuthor = this.creator;
    const tmpTown = this.town;
    let tmpPal = [];
    for (let i = 0; i < 15; ++i){tmpPal.push(this.getPalette(i));}

    if (n == "ACNH"){
      this.pattern = new ACNHFormat();
    }else if (n == "ACNL"){
      this.pattern = new ACNLFormat();
    }



    this.title = tmpTitle;
    this.creator = tmpAuthor;
    this.town = tmpTown;
    for (let i = 0; i < 15; ++i){this.setPalette(i, tmpPal[i]);}

    if (tmpMode == "ACNH"){
      //Convert from NH to NL pattern type
      switch (tmpType){
        case 0x00: this.patternType = 0x09; break;//normal pattern
        case 0x01: this.patternType = 0x09; break;//sample pro pattern
        case 0x02: this.patternType = 0x09; break;//tank top (non-pro)
        case 0x03: this.patternType = 0x03; break;//long sleeve dress shirt
        case 0x04: this.patternType = 0x01; break;//short sleeve tee
        case 0x05: this.patternType = 0x05; break;//tank top (pro)
        case 0x06: this.patternType = 0x03; break;//sweater
        case 0x07: this.patternType = 0x03; break;//hoodie
        case 0x08: this.patternType = 0x00; break;//coat
        case 0x09: this.patternType = 0x01; break;//short sleeve dress
        case 0x0a: this.patternType = 0x02; break;//sleeveless dress
        case 0x0b: this.patternType = 0x00; break;//long sleeve dress
        case 0x0c: this.patternType = 0x01; break;//balloon hem dress
        case 0x0d: this.patternType = 0x02; break;//round dress
        case 0x0e: this.patternType = 0x00; break;//robe
        case 0x0f: this.patternType = 0x07; break;//brimmed cap
        case 0x10: this.patternType = 0x07; break;//knit cap
        case 0x11: this.patternType = 0x07; break;//brimmed hat
        case 0x12: this.patternType = 0x01; break;//ACNL dress shortsleeve
        case 0x13: this.patternType = 0x00; break;//ACNL dress longsleeve
        case 0x14: this.patternType = 0x02; break;//ACNL dress sleeveless
        case 0x15: this.patternType = 0x04; break;//ACNL shirt shortsleeve
        case 0x16: this.patternType = 0x03; break;//ACNL shirt longsleeve
        case 0x17: this.patternType = 0x05; break;//ACNL shirt nosleeve
        case 0x18: this.patternType = 0x07; break;//ACNL hat
        case 0x19: this.patternType = 0x06; break;//ACNL horned hat
        default: this.patternType = 0x09; break;//others
      }
    }else if (tmpMode == "ACNL"){
      //Convert from NL to NH pattern type
      switch (tmpType){
        case 0x00: this.patternType = 0x13; break;//longsleeve dress
        case 0x01: this.patternType = 0x12; break;//halfleeve dress
        case 0x02: this.patternType = 0x14; break;//sleeveless dress
        case 0x03: this.patternType = 0x16; break;//longsleeve shirt
        case 0x04: this.patternType = 0x15; break;//halfleeve shirt
        case 0x05: this.patternType = 0x17; break;//sleeveless shirt
        case 0x06: this.patternType = 0x19; break;//hornedhat
        case 0x07: this.patternType = 0x18; break;//plainhat
        case 0x08: this.patternType = 0x01; break;//standee, not supported but let's make it an empty pro pattern I guess
        case 0x09: this.patternType = 0x00; break;//plain pattern
        default: this.patternType = 0x00; break;//others
      }
    }
    this.onLoad();
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
    //ACNH has no palette colors - just plain RGB
    if (this.pattern instanceof ACNHFormat){return "#"+toHex(rgb[0])+toHex(rgb[1])+toHex(rgb[2]);}
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
    //ACNH has no palette colors - just plain RGB
    if (this.pattern instanceof ACNHFormat){return "#"+toHex(rgb[0])+toHex(rgb[1])+toHex(rgb[2]);}
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
      let m;
      if (this.pattern instanceof ACNHFormat){
        m = this.pattern.getPalette(i);
      }else{
        m = ACNLFormat.YUVLookup[this.pattern.getPalette(i)];
      }
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
    if (this.pattern instanceof ACNLFormat){this.pattern.setPalette(idx, this.findRGB(c));}
    this.onColorChange();
    this.render();
  }

  /// Returns the HTML color of the given palette index
  getPalette(idx){
    if (idx < 0 || idx > 14){return "";}//abort for invalid indexes
    if (this.pattern instanceof ACNHFormat){
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
    opt.tool = this;
    let rTarget = new RenderTarget(c, opt);
    rTarget.calcZoom(this.pattern.width, this.pattern.texWidth);
    if (c.width >= 64 && c.height >= 64 && !opt.texture && !opt.grid && this.renderTargets.length && (this.renderTargets[0].opt.texture || this.renderTargets[0].opt.grid || this.renderTargets[0].canvas.width < 64 || this.renderTargets[0].canvas.height < 64)){
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

  renderToTarget(t, palette){
    let pixCount = this.pattern.width == 32 ? 1024 : 4096;
    t.calcZoom(this.pattern.width, this.pattern.texWidth);
    for (let i = 0; i < pixCount; i++){
      let x = (i % 32);
      let y = Math.floor(i / 32);
      let pxl = this.pixels[i];
      if (pxl == 0xFC || pxl == 15){
        t.drawPixel(x, y, "", 15);
      }else{
        t.drawPixel(x, y, palette[pxl], pxl);
      }
    }
    t.drawCallback();
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

    //Finally, copy to all others
    for (let j = 0; j < this.renderTargets.length; ++j){
      if (!j || this.renderTargets[j].opt.pbn){
        //The first target and paint-by-numbers targets can't use the copy method
        // - The first target is the copy source
        // - PBN targets need to know every pixel's color number
        this.renderToTarget(this.renderTargets[j], palette);
      }else{
        //Other targets can be fast and just blit from the first target. Yay!
        this.renderTargets[j].calcZoom(this.pattern.width, this.pattern.texWidth);
        this.renderTargets[j].blitFrom(this.renderTargets[0]);
      }
    }
  }

  /// Returns a count of the amount of pixels using the given color index
  countPixelsWithColor(idx){
    let n = 0;
    let pixCount = this.pattern.width == 32 ? 1024 : 4096;
    for (let i = 0; i < pixCount; ++i){
      if (this.pixels[i] == idx){++n;}
    }
    return n;
  }

  /// Removes duplicate colors by setting all pixels to the lowest index of that color
  dedupeColors(){
    let pixCount = this.pattern.width == 32 ? 1024 : 4096;
    let indexMap = [];
    let colorMap = {};
    //Calculate new indexes from old indexes
    for (let i = 0; i < 15; ++i){
      const c = this.getPalette(i);
      if (colorMap.hasOwnProperty(c)){
        indexMap[i] = colorMap[c];
      }else{
        colorMap[c] = i;
        indexMap[i] = i;
      }
    }
    //Change pixels to their respective indexes
    for (let i = 0; i < pixCount; ++i){
      const c = this.pixels[i];
      if (c >= 15){continue;}
      this.pixels[i] = indexMap[c];
    }
  }

  /// Sorts color indexes from most-used to least-used
  sortColors(){
    let pixCount = this.pattern.width == 32 ? 1024 : 4096;
    let indexMap = [];
    let colorMap = [];
    //Check pixel counts
    for (let i = 0; i < 15; ++i){
      colorMap.push({color: this.getPalette(i), count: this.countPixelsWithColor(i), prev:i});
    }
    //Sort by pixel count
    colorMap.sort((a,b)=>(b.count-a.count));
    //Create mapping, update palette colors
    for (let i = 0; i < 15; ++i){
      indexMap[colorMap[i].prev] = i;
      this.setPalette(i, colorMap[i].color);
    }
    //Change pixels to their respective indexes
    for (let i = 0; i < pixCount; ++i){
      const c = this.pixels[i];
      if (c >= 15){continue;}
      this.pixels[i] = indexMap[c];
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
      this.renderTargets[i].drawPixel(x, y, htmlColor, color);
      this.renderTargets[i].drawCallback();
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

  // removes a handler
  onColorChangeRemove(f = null) {
    if ((typeof f) === "function") {
      const idx = this.handleColorChange.indexOf(f);
      this.handleColorChange.splice(idx, 1);
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

export {DrawingTool as default, RenderTarget};

