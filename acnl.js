
//ACNL data layout (identical to binary QR code contents):
//
//0x 00 - 0x 29 ( 42) = Pattern Title
//0x 2A - 0x 2B (  2) = User ID
//0x 2C - 0x 3F ( 20) = User Name
//0x 40 - 0x 41 (  2) = Town ID
//0x 42 - 0x 55 ( 20) = Town Name
//0x 56 - 0x 57 (  2) = Unknown (values are usually random - changing seems to have no effect)
//0x 58 - 0x 66 ( 15) = Color code indexes
//0x 67         (  1) = Unknown (value is usually random - changing seems to have no effect)
//0x 68         (  1) = Ten? (seems to always be 0x0A)
//0x 69         (  1) = Pattern type (normal patterns: 0x09, dresses: 0x00, photo boards: 0x08)
//0x 6A - 0x 6B (  2) = Zero? (seems to always be 0x0000)
//0x 6C - 0x26B (512) = Pattern Data 1 (mandatory)
//0x26C - 0x46B (512) = Pattern Data 2 (optional)
//0x46C - 0x66B (512) = Pattern Data 3 (optional)
//0x66C - 0x86B (512) = Pattern Data 4 (optional)
//0x86C - 0x86F (  4) = Zero padding (optional)
var ACNL = function(){
  var data;
  var creator_data = null;
  var canvasses = [];
  
  function setByte(offset, val){
    data = data.substr(0,offset) + String.fromCharCode(val) + data.substr(offset+1);
  };
  function utf16(offset, len){
    var tmp = "";
    for (var i = offset; i < offset + len; i += 2){
      var char = (data.charCodeAt(i+1) << 8) + data.charCodeAt(i);
      if (char == 0){return tmp;}
      tmp += String.fromCharCode(char);
    }
    return tmp;
  };
  function to_utf16(offset, len, str){
    for (var i = 0; i < len; i++){
      if (i >= str.length){
        setByte(offset + i*2, 0);
        setByte(offset + i*2+1, 0);
      }else{
        setByte(offset + i*2, str.charCodeAt(i) & 0xFF);
        setByte(offset + i*2+1, (str.charCodeAt(i) >> 8) & 0xFF);
      }
    }
  };
  
  function copyCreator(){
    creator_data = data.substr(0x2A, 44);
  };

  function pasteCreator(){
    if (creator_data === null){
      alert("Please copy creator data before attempting to paste.");
      return;
    }
    data = data.substr(0,0x2A) + creator_data + data.substr(0x56);
  };
  
  function getCreatorID(){
    return ((data.charCodeAt(0x2A) << 8) + data.charCodeAt(0x2B)).toString(16);
  };

  function getTownID(){
    return ((data.charCodeAt(0x40) << 8) + data.charCodeAt(0x41)).toString(16);
  };
  
  function getUnknownID(){
    return ((data.charCodeAt(0x56) << 8) + data.charCodeAt(0x57)).toString(16);
  };
  
  function setCreatorID(id){
    var num = parseInt(id, 16);
    setByte(0x2A, (num >> 8) & 0xFF);
    setByte(0x2B, num & 0xFF);
  };

  function setTownID(id){
    var num = parseInt(id, 16);
    setByte(0x40, (num >> 8) & 0xFF);
    setByte(0x41, num & 0xFF);
  };
  
  function setUnknownID(id){
    var num = parseInt(id, 16);
    setByte(0x56, (num >> 8) & 0xFF);
    setByte(0x57, num & 0xFF);
  };
  
  function getTitle(){return utf16(0, 40);};
  function getCreator(){return utf16(0x2c, 20);};
  function getTown(){return utf16(0x42, 20);};

  function setTitle(str){to_utf16(0, 20, str);};
  function setCreator(str){to_utf16(0x2c, 10, str);};
  function setTown(str){to_utf16(0x42, 10, str);};
  
  function getWidth(){
    if (data.length == 0x870){return 64;}
    return 32;
  };
  
  function getZoom(cnvs){
    if ($(cnvs).width() < $(cnvs).height()){
      return Math.floor($(cnvs).width() / getWidth());
    }else{
      return Math.floor($(cnvs).height() / getWidth());
    }
    return 1;
  };
  
  function download(){
    try{
      var ab = new ArrayBuffer(data.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < data.length; i++) {
        ia[i] = data.charCodeAt(i);
      }
      var blob = new Blob([ia], {"type": "application/octet-stream"});
      saveAs(blob, utf16(0, 42)+".acnl");
    }catch(e){
      alert("Failed to save file. Try using a different browser. :-(");
    }
  };
  
  function qr(obj){
    obj.html("");
    if (getWidth() == 64){
      obj.qrcode({"correctLevel":0, "text":data.substr(0, 0x21C), "render":"canvas", "width":512, "height":512, "multipart_num":0, "multipart_total":3, "multipart_parity":0x77});
      obj.qrcode({"correctLevel":0, "text":data.substr(0x21C, 0x21C), "render":"canvas", "width":512, "height":512, "multipart_num":1, "multipart_total":3, "multipart_parity":0x77});
      obj.qrcode({"correctLevel":0, "text":data.substr(0x21C*2, 0x21C), "render":"canvas", "width":512, "height":512, "multipart_num":2, "multipart_total":3, "multipart_parity":0x77});
      obj.qrcode({"correctLevel":0, "text":data.substr(0x21C*3, 0x21C), "render":"canvas", "width":512, "height":512, "multipart_num":3, "multipart_total":3, "multipart_parity":0x77});
    }else{
      obj.qrcode({"correctLevel":0, "text":data, "render":"canvas", "width":512, "height":512});
    }
  };
  
  function draw_offset(ctx, j, col, zoom){
    var x = (j % 32);
    var y = Math.floor(j / 32);
    drawPixel(ctx, x, y, col, zoom);
  };

  function draw(canvas_draw){
    var zoom = getZoom(canvas_draw);
    var ctx=canvas_draw.getContext("2d");
    if ($.inArray(ctx, canvasses) == -1){
      canvasses.push(ctx);
    }
    var offset = 0x6C;
    for (var i = offset; i < data.length; i++){
      dpoint = data.charCodeAt(i);
      draw_offset(ctx, (i - offset)*2, dpoint & 0x0F, zoom);
      draw_offset(ctx, (i - offset)*2 + 1, (dpoint >> 4) & 0x0F, zoom);
    }
  };//draw
  
  function drawPixel(context, x, y, col, zoom){
    if (y > 63){
      y -= 64; x += 32;
    }
    try{
      //draw the pixel
      context.fillStyle=getColor(col);
      context.fillRect(x*zoom,y*zoom,zoom,zoom);
      //if zoom > 5, draw a line
      if (zoom > 5){
        context.fillStyle="#AAAAAA";
        context.fillRect(x*zoom+zoom-1,y*zoom,1,zoom);
        context.fillRect(x*zoom,y*zoom+zoom-1,zoom,1);
      }
    }catch(e){};
  };
  
  function setColor(x, y, c){
    if (x < 0 || y < 0 || c < 0 || c > 15 || x > 63 || y > 63 || isNaN(x) || isNaN(y)){return false;}
    if (data.length != 0x870 && (x > 31 || y > 31)){return false;}
    var offset = 0x6C + Math.floor(x/2) + y*16;
    var val = data.charCodeAt(offset) & 0xFF;
    var oldval = val;
    if ((x % 2) == 1){
      val = (val & 0x0F) + (c << 4);
    }else{
      val = (val & 0xF0) + c;
    }
    if (val == oldval){
      return;
    }
    setByte(offset, val);
    for (var i in canvasses){
      drawPixel(canvasses[i], x, y, c, getZoom(canvasses[i].canvas));
    }
  };
  
  function getPal(clr){
    switch (clr){
      //pinks
      case 0x00: return "#FFEFFF";
      case 0x01: return "#FF9AAD";
      case 0x02: return "#EF559C";
      case 0x03: return "#FF65AD";
      case 0x04: return "#FF0063";
      case 0x05: return "#BD4573";
      case 0x06: return "#CE0052";
      case 0x07: return "#9C0031";
      case 0x08: return "#522031";
      
      //reds
      case 0x10: return "#FFBACE";
      case 0x11: return "#FF7573";
      case 0x12: return "#DE3010";
      case 0x13: return "#FF5542";
      case 0x14: return "#FF0000";
      case 0x15: return "#CE6563";
      case 0x16: return "#BD4542";
      case 0x17: return "#BD0000";
      case 0x18: return "#8C2021";
      
      //oranges
      case 0x20: return "#DECFBD";
      case 0x21: return "#FFCF63";
      case 0x22: return "#DE6521";
      case 0x23: return "#FFAA21";
      case 0x24: return "#FF6500";
      case 0x25: return "#BD8A52";
      case 0x26: return "#DE4500";
      case 0x27: return "#BD4500";
      case 0x28: return "#633010";
      
      //pastels or something, I guess?
      case 0x30: return "#FFEFDE";
      case 0x31: return "#FFDFCE";
      case 0x32: return "#FFCFAD";
      case 0x33: return "#FFBA8C";
      case 0x34: return "#FFAA8C";
      case 0x35: return "#DE8A63";
      case 0x36: return "#BD6542";
      case 0x37: return "#9C5531";
      case 0x38: return "#8C4521";
      
      //purple
      case 0x40: return "#FFCFFF";
      case 0x41: return "#EF8AFF";
      case 0x42: return "#CE65DE";
      case 0x43: return "#BD8ACE";
      case 0x44: return "#CE00FF";
      case 0x45: return "#9C659C";
      case 0x46: return "#8C00AD";
      case 0x47: return "#520073";
      case 0x48: return "#310042";
      
      //pink
      case 0x50: return "#FFBAFF";
      case 0x51: return "#FF9AFF";
      case 0x52: return "#DE20BD";
      case 0x53: return "#FF55EF";
      case 0x54: return "#FF00CE";
      case 0x55: return "#8C5573";
      case 0x56: return "#BD009C";
      case 0x57: return "#8C0063";
      case 0x58: return "#520042";
      
      //brown
      case 0x60: return "#DEBA9C";
      case 0x61: return "#CEAA73";
      case 0x62: return "#734531";
      case 0x63: return "#AD7542";
      case 0x64: return "#9C3000";
      case 0x65: return "#733021";
      case 0x66: return "#522000";
      case 0x67: return "#311000";
      case 0x68: return "#211000";
      
      //yellow
      case 0x70: return "#FFFFCE";
      case 0x71: return "#FFFF73";
      case 0x72: return "#DEDF21";
      case 0x73: return "#FFFF00";
      case 0x74: return "#FFDF00";
      case 0x75: return "#CEAA00";
      case 0x76: return "#9C9A00";
      case 0x77: return "#8C7500";
      case 0x78: return "#525500";
      
      //blue
      case 0x80: return "#DEBAFF";
      case 0x81: return "#BD9AEF";
      case 0x82: return "#6330CE";
      case 0x83: return "#9C55FF";
      case 0x84: return "#6300FF";
      case 0x85: return "#52458C";
      case 0x86: return "#42009C";
      case 0x87: return "#210063";
      case 0x88: return "#211031";
      
      //ehm... also blue?
      case 0x90: return "#BDBAFF";
      case 0x91: return "#8C9AFF";
      case 0x92: return "#3130AD";
      case 0x93: return "#3155EF";
      case 0x94: return "#0000FF";
      case 0x95: return "#31308C";
      case 0x96: return "#0000AD";
      case 0x97: return "#101063";
      case 0x98: return "#000021";
      
      //green
      case 0xA0: return "#9CEFBD";
      case 0xA1: return "#63CF73";
      case 0xA2: return "#216510";
      case 0xA3: return "#42AA31";
      case 0xA4: return "#008A31";
      case 0xA5: return "#527552";
      case 0xA6: return "#215500";
      case 0xA7: return "#103021";
      case 0xA8: return "#002010";
      
      //icky greenish yellow
      case 0xB0: return "#DEFFBD";
      case 0xB1: return "#CEFF8C";
      case 0xB2: return "#8CAA52";
      case 0xB3: return "#ADDF8C";
      case 0xB4: return "#8CFF00";
      case 0xB5: return "#ADBA9C";
      case 0xB6: return "#63BA00";
      case 0xB7: return "#529A00";
      case 0xB8: return "#316500";
      
      //Wtf? More blue?
      case 0xC0: return "#BDDFFF";
      case 0xC1: return "#73CFFF";
      case 0xC2: return "#31559C";
      case 0xC3: return "#639AFF";
      case 0xC4: return "#1075FF";
      case 0xC5: return "#4275AD";
      case 0xC6: return "#214573";
      case 0xC7: return "#002073";
      case 0xC8: return "#001042";
      
      //gonna call this cyan
      case 0xD0: return "#ADFFFF";
      case 0xD1: return "#52FFFF";
      case 0xD2: return "#008ABD";
      case 0xD3: return "#52BACE";
      case 0xD4: return "#00CFFF";
      case 0xD5: return "#429AAD";
      case 0xD6: return "#00658C";
      case 0xD7: return "#004552";
      case 0xD8: return "#002031";
      
      //more cyan, because we didn't have enough blue-like colors yet
      case 0xE0: return "#CEFFEF";
      case 0xE1: return "#ADEFDE";
      case 0xE2: return "#31CFAD";
      case 0xE3: return "#52EFBD";
      case 0xE4: return "#00FFCE";
      case 0xE5: return "#73AAAD";
      case 0xE6: return "#00AA9C";
      case 0xE7: return "#008A73";
      case 0xE8: return "#004531";
      
      //also green. Fuck it, whatever.
      case 0xF0: return "#ADFFAD";
      case 0xF1: return "#73FF73";
      case 0xF2: return "#63DF42";
      case 0xF3: return "#00FF00";
      case 0xF4: return "#21DF21";
      case 0xF5: return "#52BA52";
      case 0xF6: return "#00BA00";
      case 0xF7: return "#008A00";
      case 0xF8: return "#214521";
      
      //greys
      case 0x0F: return "#FFFFFF";
      case 0x1F: return "#ECECEC";
      case 0x2F: return "#DADADA";
      case 0x3F: return "#C8C8C8";
      case 0x4F: return "#B6B6B6";
      case 0x5F: return "#A3A3A3";
      case 0x6F: return "#919191";
      case 0x7F: return "#7F7F7F";
      case 0x8F: return "#6D6D6D";
      case 0x9F: return "#5B5B5B";
      case 0xAF: return "#484848";
      case 0xBF: return "#363636";
      case 0xCF: return "#242424";
      case 0xDF: return "#121212";
      case 0xEF: return "#000000";
      
      default:
        //0x?9 - 0x?E aren't used. Not sure what they do in-game. Can somebody test this?
        //0xFF is displayed as white in-game, editing it causes a game freeze.
        return "";
    }
  };
  
  function setIndex(index, clr){
    setByte(0x58 + index, clr);
    var offset = 0x6C;
    for (var z in canvasses){
      var zoom = getZoom(canvasses[z].canvas);
      for (var i = offset; i < data.length; i++){
        dpoint = data.charCodeAt(i);
        col = dpoint & 0x0F;
        if (col == index){
          j = (i - offset)*2;
          drawPixel(canvasses[z], (j % 32), Math.floor(j / 32), index, zoom);
        }
        col = (dpoint >> 4) & 0x0F;
        if (col == index){
          j = (i - offset)*2 + 1;
          drawPixel(canvasses[z], (j % 32), Math.floor(j / 32), index, zoom);
        }
      }
    }
  };
  
  function getIndex(col){
    return data.charCodeAt(0x58 + col);
  };
  
  function getColor(col){
    return getPal(getIndex(col));
  };
  
  return {"download":download, "load":function(d){data = d;}, "draw":draw, "qr":qr, "getColor":getColor, "getTitle":getTitle, "getCreator":getCreator, "getTown":getTown, "getCreatorID":getCreatorID, "getTownID":getTownID, "getUnknownID":getUnknownID, "setColor":setColor, "setTitle":setTitle, "setCreator":setCreator, "setTown":setTown, "setCreatorID":setCreatorID, "setTownID":setTownID, "setUnknownID":setUnknownID, "getPal":getPal, "setIndex":setIndex, "getIndex":getIndex, "copyCreator":copyCreator, "pasteCreator":pasteCreator, "getWidth":getWidth};
}();
