//ACNL data layout.
//
//QR codes are blocks of 540 bytes each, providing this data in sequence:
//
//0x 00 - 0x 29 ( 42) = Pattern Title
//0x 2A - 0x 2B (  2) = User ID
//0x 2C - 0x 3F ( 20) = User Name
//0x 40 - 0x 41 (  2) = Town ID
//0x 42 - 0x 55 ( 20) = Town Name
//0x 56 - 0x 57 (  2) = Unknown A (values are usually random - changing seems to have no effect)
//0x 58 - 0x 66 ( 15) = Color code indexes
//0x 67         (  1) = Unknown B (value is usually random - changing seems to have no effect)
//0x 68         (  1) = Unknown C (seems to always be 0x0A or 0x00)
//0x 69         (  1) = Pattern type (see below)
//0x 6A - 0x 6B (  2) = Unknown D (seems to always be 0x0000)
//0x 6C - 0x26B (512) = Pattern Data 1 (mandatory)
//0x26C - 0x46B (512) = Pattern Data 2 (optional)
//0x46C - 0x66B (512) = Pattern Data 3 (optional)
//0x66C - 0x86B (512) = Pattern Data 4 (optional)
//0x86C - 0x86F (  4) = Zero padding (optional)
//
// Pattern types:
// 0x00 = Fullsleeve dress (pro)
// 0x01 = Halfsleeve dress (pro)
// 0x02 = Sleeveless dress (pro)
// 0x03 = Fullsleeve shirt (pro)
// 0x04 = Halfsleeve shirt (pro)
// 0x05 = Sleeveless shirt (pro)
// 0x06 = Hat with horns
// 0x07 = Hat
// 0x08 = Standee (pro)
// 0x09 = Plain pattern (easel)

import fnv1a128 from "./fnv1a.js";

class ACNLFormat{
  ///Either transfers an existing ArrayBuffer, or creates a new pattern, optionally using the passed pattern type.
  constructor(qr_buffer = null){
    this.b = null;

    //If we were passed an arraybuffer, copy it.
    if (qr_buffer instanceof ArrayBuffer){
      //Create new buffer
      this.b = new ArrayBuffer(qr_buffer.byteLength > 620 ? 2160 : 620);
      this.dataView = new DataView(this.b, 0, this.b.byteLength);
      this.dataBytes = new Uint8Array(this.b, 0, this.b.byteLength);
      //Copy contents from input
      let inBytes = new Uint8Array(qr_buffer, 0, qr_buffer.byteLength);
      for (let i = 0; i < qr_buffer.byteLength && i < this.b.byteLength; ++i){
        this.dataBytes[i] = inBytes[i];
      }
    }

    //If we were passed an uint8array, copy it.
    if (qr_buffer instanceof Uint8Array){
      //Create new buffer
      this.b = new ArrayBuffer(qr_buffer.byteLength > 620 ? 2160 : 620);
      this.dataView = new DataView(this.b, 0, this.b.byteLength);
      this.dataBytes = new Uint8Array(this.b, 0, this.b.byteLength);
      //Copy contents from input
      for (let i = 0; i < qr_buffer.byteLength && i < this.b.byteLength; ++i){
        this.dataBytes[i] = qr_buffer[i];
      }
    }

    //If we were passed a string that is long enough, convert and copy it.
    if ((typeof qr_buffer) == "string" && qr_buffer.length >= 620){
      //Create new buffer
      this.b = new ArrayBuffer(qr_buffer.length > 620 ? 2160 : 620);
      this.dataView = new DataView(this.b, 0, this.b.byteLength);
      this.dataBytes = new Uint8Array(this.b, 0, this.b.byteLength);
      //Copy contents from input
      for (let i = 0; i < qr_buffer.length && i < this.b.byteLength; ++i){
        this.dataBytes[i] = qr_buffer.charCodeAt(i);
      }
    }

    //No pattern yet? Let's create one based on the create_pat_type type.
    if (this.b === null){
      //If we're creating new patterns, make them easel-type, unless our argument was a number, then use that type number.
      let create_pat_type = 9;//easel
      if ((typeof qr_buffer) == "number"){create_pat_type = qr_buffer;}
      this.b = new ArrayBuffer(ACNLFormat.bytesForType(create_pat_type));
      this.dataView = new DataView(this.b, 0, this.b.byteLength);
      this.dataBytes = new Uint8Array(this.b, 0, this.b.byteLength);
      this.title = "Empty";
      this.creator = ["Unknown", 0];
      this.town = ["Unknown", 0];
      this.unknown_a = 0x3119;
      this.setDefaultPalette();
      this.unknown_b = 0xCC;
      this.unknown_c = 10;
      this.patternType = create_pat_type;
    }

    if (ACNLFormat.typeInfo[this.patternType]){
      this.currMask = ACNLFormat.typeInfo[this.patternType].mask;
    }else{
      this.currMask = null;
    }
  }

  ///UTF16 decode helper
  utf16_decode(offset, len){
    let tmp = "";
    for (let i = 0; i < len; i += 2){
      let nextChar = this.dataView.getUint16(offset+i, true);
      if (nextChar == 0){return tmp;}
      tmp += String.fromCharCode(nextChar);
    }
    return tmp;
  };

  ///UTF16 encode helper
  utf16_encode(offset, len, str){
    for (let i = 0; i < len/2; i++){
      if (i >= str.length){
        this.dataView.setUint16(offset+i*2, 0, true);
      }else{
        this.dataView.setUint16(offset+i*2, str.charCodeAt(i), true);
      }
    }
  };

  ///Converts to a "normal" string
  toString(){
    let str = "";
    const l = Math.min(this.byteLength, this.b.byteLength);
    for (let i = 0; i < l; i++){str += String.fromCharCode(this.dataBytes[i]);}
    return str;
  }


  ///Decodes a raw pattern to internal JSON format
  toJSON(b){
    let r = {
      title: this.title,
      author: [this.creator, this.town],
      unknown: {
        A: this.unknown_a,
        B: this.unknown_b,
        C: this.unknown_c,
        D: this.unknown_d
      },
      texture_size: this.width,
      pattern_type: this.patternType,
      pattern_type_str: ACNLFormat.getTypeStr(this.patternType),
    };
    return r;
  }

  ///Writes the ACNL pattern structure to the passed ArrayBuffer object as an array of palette indexes
  toPixels(ab){
    let offset = 0x6C;
    let pixel = 0;
    for (let i = offset; i < this.b.byteLength && pixel < ab.byteLength; i++){
      ab[pixel++] = (this.dataBytes[i] & 0x0F);
      ab[pixel++] = ((this.dataBytes[i] >> 4) & 0x0F);
    }

    /* Used to generate the masks
    let mask = [];
    for (let i = 0; i < 128; ++i){mask[i] = 0;}
    for (let i = 0; i < ab.byteLength; ++i){
      if (ab[i] == 12){mask[i >> 5] += (1 << (i&0x1f));}
    }
    console.log(mask);
    */

    //If any pixels are masked, give them a special value
    if (this.currMask){
      for (let i = 0; i < ab.byteLength; i++){
        if (this.currMask[i >> 5] & (1 << (i&0x1f))){ab[i] = 0xFC;}
      }
    }
  }

  ///Writes passed ArrayBuffer of palette indexes to the ACNL structure
  fromPixels(ab){
    let offset = 0x6C;
    let pixel = 0;
    for (let i = offset; i < this.b.byteLength; i++){
      this.dataBytes[i] = (ab[pixel] & 0x0F) + ((ab[pixel+1] & 0x0F) << 4);
      pixel += 2;
    }
  }

  getPalette(i){
    if (i < 0 || i > 14){return 0;}
    return this.dataBytes[0x58 + i];
  }
  
  setPalette(i, newVal){
    if (i < 0 || i > 14){return;}
    this.dataBytes[0x58 + i] = newVal;
  }

  set title(newTitle){this.utf16_encode(0, 40, newTitle);};
  get title(){return this.utf16_decode(0, 40);};
  set creator(n){
    if (n instanceof Array && n.length == 2){this.creator = n[0]; this.creator = n[1]; return;}
    if ((typeof n) == "string"){this.utf16_encode(0x2C, 18, n);}
    if ((typeof n) == "number"){this.dataView.setUint16(0x2A, n, true);}
  };
  get creator(){
    return [this.utf16_decode(0x2C, 18), this.dataView.getUint16(0x2A, true), this.dataBytes[0x44]?"Male":"Female"];
  };
  set town(n){
    if (n instanceof Array && n.length == 2){this.town = n[0]; this.town = n[1]; return;}
    if ((typeof n) == "string"){this.utf16_encode(0x42, 18, n);}
    if ((typeof n) == "number"){this.dataView.setUint16(0x40, n, true);}
  };
  get town(){
    return [this.utf16_decode(0x42, 18), this.dataView.getUint16(0x40, true)];
  };
  set unknown_a(newVal){
    this.dataView.setUint16(0x56, newVal, true);
  };
  get unknown_a(){
    return this.dataView.getUint16(0x56, true);
  };
  setDefaultPalette(){
    for (let i = 0; i < 15; i++){
      this.dataBytes[0x58 + i] = 0x10*i + 0xF;
    }
  };
  set unknown_b(newVal){
    this.dataBytes[0x67] = newVal;
  };
  get unknown_b(){
    return this.dataBytes[0x67];
  };
  set unknown_c(newVal){
    this.dataBytes[0x68] = newVal;
  };
  get unknown_c(){
    return this.dataBytes[0x68];
  };
  set patternType(newVal){
    if (this.width != ACNLFormat.widthForType(newVal)){
      //Create new buffer
      let nb = new ArrayBuffer(ACNLFormat.widthForType(newVal) > 32 ? 2160 : 620);
      let ndataView = new DataView(nb);
      let ndataBytes = new Uint8Array(nb);
      //Copy contents from original
      for (let i = 0; i < nb.byteLength && i < this.b.byteLength; ++i){
        ndataBytes[i] = this.dataBytes[i];
      }
      //Replace old buffers/views
      this.dataView = ndataView;
      this.dataBytes = ndataBytes;
      this.b = nb;
    }
    this.dataBytes[0x69] = newVal;
    if (ACNLFormat.typeInfo[this.patternType]){
      this.currMask = ACNLFormat.typeInfo[this.patternType].mask;
    }else{
      this.currMask = null;
    }
  };
  get patternType(){
    return this.dataBytes[0x69];
  };
  static getTypeStr(val){
    if (ACNLFormat.typeInfo[val] && ACNLFormat.typeInfo[val].name){
      return ACNLFormat.typeInfo[val].name;
    }
    return "Unimplemented pattern type";
  };
  set unknown_d(newVal){
    this.dataView.setUint16(0x6A, newVal, true);
  };
  get unknown_d(){
    return this.dataView.getUint16(0x6A, true);
  };
  get width(){
    if (!ACNLFormat.typeInfo[this.dataBytes[0x69]]){return 32;}
    return ACNLFormat.typeInfo[this.dataBytes[0x69]].size;
  }
  get height(){
    if (!ACNLFormat.typeInfo[this.dataBytes[0x69]]){return 32;}
    return ACNLFormat.typeInfo[this.dataBytes[0x69]].size;
  }
  get byteLength(){
    return (this.width > 32) ? 2160 : 620;
  }
  ///Returns FNV-1a 128-bit hash of the pixel data only
  pixelHash(){
    return fnv1a128(this.b, 0x58, (this.width > 32) ? (20+512*4) : (20+512));
  }
  ///Returns FNV-1a 128-bit hash of the whole pattern
  fullHash(){
    return fnv1a128(this.b, 0, this.byteLength);
  }
  //Fixes common problems with patterns
  fixIssues(){
    if (!this.creator[1]){this.creator = 60598;}
    if (!this.town[1]){this.town = 50500;}
    //End town with wide-zero
    this.dataBytes[0x42+18] = 0;
    this.dataBytes[0x42+19] = 0;
    //End creator with valid gender and zero pad
    if (this.dataBytes[0x2C+18] > 1){this.dataBytes[0x2C+18] = 0;}
    this.dataBytes[0x2C+19] = 0;
    //End title with wide-zero
    this.dataBytes[40] = 0;
    this.dataBytes[41] = 0;
  }
  static widthForType(t){
    return ACNLFormat.typeInfo[t].size;
  }
  static bytesForType(t){
    return this.widthForType(t) > 32 ? 2160 : 620;
  }
};

ACNLFormat.paletteColors = [
  //Back in June 2013 when I first made this list, I worked off of a heavily post-processed PHOTOGRAPH of the 3DS screen.
  //Now, in 2020, we have emulators. I took an oversampled screenshot of the editor screen and went through and fixed all these colors by hand.
  //Now, my question to everyone else: why did you all just copy my wrong list of colors, instead of grabbing an emulator and finding the correct values...? Come on guys, put some work in! -_-
  //Pinks (0x00 - 0x08)
  "#FFEEFF", "#FF99AA", "#EE5599", "#FF66AA", "#FF0066", "#BB4477", "#CC0055", "#990033", "#552233",
  "","","","","","",//0x09-0x0E unused / unknown
  "#FFFFFF", //0x0F: Grey 1
  //Reds (0x10 - 0x18)
  "#FFBBCC", "#FF7777", "#DD3210", "#FF5544", "#FF0000", "#CC6666", "#BB4444", "#BB0000", "#882222",
  "","","","","","",//0x19-0x1E unused / unknown
  "#EEEEEE", //0x1F: Grey 2
  //Oranges (0x20 - 0x28)
  "#DDCDBB", "#FFCD66", "#DD6622", "#FFAA22", "#FF6600", "#BB8855", "#DD4400", "#BB4400", "#663210",
  "","","","","","",//0x29-0x2E unused / unknown
  "#DDDDDD", //0x2F: Grey 3
  //Pastels or something, I guess? (0x30 - 0x38)
  "#FFEEDD", "#FFDDCC", "#FFCDAA", "#FFBB88", "#FFAA88", "#DD8866", "#BB6644", "#995533", "#884422",
  "","","","","","",//0x39-0x3E unused / unknown
  "#CCCDCC", //0x3F: Grey 4
  //Purple (0x40 - 0x48)
  "#FFCDFF", "#EE88FF", "#CC66DD", "#BB88CC", "#CC00FF", "#996699", "#8800AA", "#550077", "#330044",
  "","","","","","",//0x49-0x4E unused / unknown
  "#BBBBBB", //0x4F: Grey 5
  //Pink (0x50 - 0x58)
  "#FFBBFF", "#FF99FF", "#DD22BB", "#FF55EE", "#FF00CC", "#885577", "#BB0099", "#880066", "#550044",
  "","","","","","",//0x59-0x5E unused / unknown
  "#AAAAAA", //0x5F: Grey 6
  //Brown (0x60 - 0x68)
  "#DDBB99", "#CCAA77", "#774433", "#AA7744", "#993200", "#773222", "#552200", "#331000", "#221000",
  "","","","","","",//0x69-0x6E unused / unknown
  "#999999", //0x6F: Grey 7
  //Yellow (0x70 - 0x78)
  "#FFFFCC", "#FFFF77", "#DDDD22", "#FFFF00", "#FFDD00", "#CCAA00", "#999900", "#887700", "#555500",
  "","","","","","",//0x79-0x7E unused / unknown
  "#888888", //0x7F: Grey 8
  //Blue (0x80 - 0x88)
  "#DDBBFF", "#BB99EE", "#6632CC", "#9955FF", "#6600FF", "#554488", "#440099", "#220066", "#221033",
  "","","","","","",//0x89-0x8E unused / unknown
  "#777777", //0x8F: Grey 9
  //Ehm... also blue? (0x90 - 0x98)
  "#BBBBFF", "#8899FF", "#3332AA", "#3355EE", "#0000FF", "#333288", "#0000AA", "#101066", "#000022",
  "","","","","","",//0x99-0x9E unused / unknown
  "#666666", //0x9F: Grey 10
  //Green (0xA0 - 0xA8)
  "#99EEBB", "#66CD77", "#226610", "#44AA33", "#008833", "#557755", "#225500", "#103222", "#002210",
  "","","","","","",//0xA9-0xAE unused / unknown
  "#555555", //0xAF: Grey 11
  //Icky greenish yellow (0xB0 - 0xB8)
  "#DDFFBB", "#CCFF88", "#88AA55", "#AADD88", "#88FF00", "#AABB99", "#66BB00", "#559900", "#336600",
  "","","","","","",//0xB9-0xBE unused / unknown
  "#444444", //0xBF: Grey 12
  //Wtf? More blue? (0xC0 - 0xC8)
  "#BBDDFF", "#77CDFF", "#335599", "#6699FF", "#1077FF", "#4477AA", "#224477", "#002277", "#001044",
  "","","","","","",//0xC9-0xCE unused / unknown
  "#333233", //0xCF: Grey 13
  //Gonna call this cyan (0xD0 - 0xD8)
  "#AAFFFF", "#55FFFF", "#0088BB", "#55BBCC", "#00CDFF", "#4499AA", "#006688", "#004455", "#002233",
  "","","","","","",//0xD9-0xDE unused / unknown
  "#222222", //0xDF: Grey 14
  //More cyan, because we didn't have enough blue-like colors yet (0xE0 - 0xE8)
  "#CCFFEE", "#AAEEDD", "#33CDAA", "#55EEBB", "#00FFCC", "#77AAAA", "#00AA99", "#008877", "#004433",
  "","","","","","",//0xE9-0xEE unused / unknown
  "#000000", //0xEF: Grey 15
  //Also green. Fuck it, whatever. (0xF0 - 0xF8)
  "#AAFFAA", "#77FF77", "#66DD44", "#00FF00", "#22DD22", "#55BB55", "#00BB00", "#008800", "#224422",
  "","","","","","",//0xF9-0xFE unused / unknown
  "", //0xFF unused (white in-game, editing freezes the game)
];

//General info about the various types of patterns in ACNL
//Masks define areas that cannot be drawn to (true = masked, false = normal).
//Masks use a compact notation of 32-bit masks, otherwise we'd have a giant list of true/false here.
ACNLFormat.typeInfo = [];

ACNLFormat.typeInfo[0] = {name:"Dress, long sleeves", size:64, sections:[0, 0, 64, 64]};
ACNLFormat.typeInfo[1] = {name:"Dress, short sleeves", size:64, sections:[0, 0, 64, 64],
  mask: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};
ACNLFormat.typeInfo[2] = {name:"Dress, sleeveless", size:64, sections:[0, 0, 64, 64],
  mask: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};
ACNLFormat.typeInfo[3] = {name:"Shirt, long sleeves", size:64, sections:[0, 0, 64, 64],
  mask: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]};
ACNLFormat.typeInfo[4] = {name:"Shirt, short sleeves", size:64, sections:[0, 0, 64, 64],
  mask: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-65536,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]};
ACNLFormat.typeInfo[5] = {name:"Shirt, sleeveless", size:64, sections:[0, 0, 64, 64],
  mask: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]};
ACNLFormat.typeInfo[6] = {name:"Hat with horns", size:32, sections:[0, 0, 32, 32]};
ACNLFormat.typeInfo[7] = {name:"Hat without horns", size:32, sections:[0, 0, 32, 32]};
ACNLFormat.typeInfo[8] = {
  name: "Standee",
  size: 64,
  sections: [0, 0, 52, 64],
  mask: [0,0,0,0,0,0,0,0,0,0,0,0,0,1069547520,-524288,-131072,-65536,-32768,-16384,-16384,-8192,-8192,-8192,-8192,-8192,-16384,-16384,-32768,-65536,-262144,-1048576,528482304,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048575,-1048569,-1048561,-1048545,-1048513,-1048513,-1048449,-1048449,-1048449,-1048449,-1048449,-1048513,-1048545,-1048545,-1048561,-1048573,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576,-1048576]
};
ACNLFormat.typeInfo[9] = {name:"Normal pattern (easel)", size:32, sections:[0, 0, 32, 32]};

//Generate global lookup table
ACNLFormat.RGBLookup = [];
ACNLFormat.YUVLookup = [];
for (let i = 0; i < 256; i++){
  let m = ACNLFormat.paletteColors[i];
  if (m.length < 7){
    ACNLFormat.RGBLookup.push(null);
    ACNLFormat.YUVLookup.push(null);
  }else{
    let rgb = [parseInt(m.substr(1, 2), 16), parseInt(m.substr(3, 2), 16), parseInt(m.substr(5, 2), 16)];
    ACNLFormat.RGBLookup.push(rgb);
    ACNLFormat.YUVLookup.push([rgb[0] *  .299000 + rgb[1] *  .587000 + rgb[2] *  .114000, rgb[0] * -.168736 + rgb[1] * -.331264 + rgb[2] *  .500000 + 128, rgb[0] *  .500000 + rgb[1] * -.418688 + rgb[2] * -.081312 + 128]);
  }
}


export default ACNLFormat;

