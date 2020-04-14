//ACNH data layout.
//Blocks of 680 or 2216 bytes each, providing this data in sequence:

//Generic header:
//  0x000: 4 bytes checksum
//  0x004: 09 -> unknown (seems to always be 09)
//  0x005: 11 bytes zero padding(?)
//  0x010: 40 bytes pattern title
//  0x038:  4 bytes island ID (0xFFFFFFFF for imported)
//  0x03C: 20 bytes island name
//  0x050:  4 bytes (02 00 00 00) unknown (zeroes for imported)
//  0x054:  4 bytes author ID (0xFFFFFFFF for imported)
//  0x058: 20 bytes author name
//  0x06C:  4 bytes (00 00 00 00) zero?
//  0x070:  2 bytes (04 EE / 01 EE) unknown (0F DD on imported)
//  0x072:  6 bytes (00 00 00 00 00 00) zero?
//  0x078: 15x3 bytes, 24-bit RGB palette colors
//
//Regular:
//  0x0A5: 512 bytes of pixel data (identical format as ACNL, nibble per pixel, little-endian)
//
//Pro:
//  0x0A5: 2048 bytes of pixel data (identical format as ACNL, nibble per pixel, little-endian)
//
//Generic footer:
//  0x*A5: 1 byte pattern type
//  0x*A7: 2 bytes zero padding (?)
//
//Pattern Types:
//  00 = normal pattern
//  01 = sample pro pattern
//  02 = tank top (non-pro)
//  03 = long sleeve dress shirt
//  04 = short sleeve tee
//  05 = tank top (pro)
//  06 = sweater
//  07 = hoodie
//  08 = coat
//  09 = short sleeve dress
//  0a = sleeveless dress
//  0b = long sleeve dress
//  0c = balloon hem dress
//  0d = round dress
//  0e = robe
//  0f = brimmed cap
//  10 = knit cap
//  11 = brimmed hat
//  12 = ?
//  13 = ACNL dress longsleeve
//  14 = ?
//  15 = ?
//  16 = ?
//  17 = ACNL shirt, nosleeve
//  18 = ACNL hat
//
//Unknown values:
//  ACNL shirt, halfsleeve
//  ACNL shirt, longsleeve
//  ACNL dress, halfsleeve
//  ACNL dress, nosleeve
//  ACNL hat with horns
//
//
//50 regular patterns of 680 bytes each are stored in main.dat starting at offset 1930000
//50 pro patterns of 2216 bytes each are stored in main.dat starting at offset 1964000
//1 regular pattern (town flag) of 680 bytes in main.dat starting at offset 2074800
//8 pro patterns (able sisters) of 2216 bytes each are stored in main.dat starting at offset 2075480

//Colors:
//  H =         NUM * 12;
//  V = 7.843 + NUM * 5.85
//  S =         NUM * 6.68
const Sstart = 0;
const Sinc = 6.68;
const Vstart = 7.843;
const Vinc = 5.85;

import fnv1a128 from "./fnv1a.js";

class ACNHFormat{
  ///Either transfers an existing ArrayBuffer, or creates a new pattern, optionally using the passed pattern type.
  constructor(qr_buffer = null){
    this.b = null;

    //If we were passed an arraybuffer, copy it.
    if (qr_buffer instanceof ArrayBuffer){
      //Create new buffer
      this.b = new ArrayBuffer(qr_buffer.byteLength > 680 ? 2216 : 680);
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
      this.b = new ArrayBuffer(qr_buffer.byteLength > 680 ? 2216 : 680);
      this.dataView = new DataView(this.b, 0, this.b.byteLength);
      this.dataBytes = new Uint8Array(this.b, 0, this.b.byteLength);
      //Copy contents from input
      for (let i = 0; i < qr_buffer.byteLength && i < this.b.byteLength; ++i){
        this.dataBytes[i] = qr_buffer[i];
      }
    }

    //If we were passed a string that is long enough, convert and copy it.
    if ((typeof qr_buffer) == "string" && qr_buffer.length >= 680){
      //Create new buffer
      this.b = new ArrayBuffer(qr_buffer.length > 680 ? 2216 : 680);
      this.dataView = new DataView(this.b, 0, this.b.byteLength);
      this.dataBytes = new Uint8Array(this.b, 0, this.b.byteLength);
      //Copy contents from input
      for (let i = 0; i < qr_buffer.length && i < this.b.byteLength; ++i){
        this.dataBytes[i] = qr_buffer.charCodeAt(i);
      }
    }

    /*
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
    */
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
      texture_size: this.width,
      pattern_type: this.patternType,
      pattern_type_str: "Unimplemented"//ACNLFormat.getTypeStr(this.patternType),
    };
    return r;
  }

  ///Writes the ACNH pattern structure to the passed ArrayBuffer object as an array of palette indexes
  toPixels(ab){
    let offset = 0xA5;
    let pixel = 0;
    if (this.b.byteLength > 680){
      for (let x = 0; x < 32; x+=2){
        for (let y = 0; y < 128; ++y){
          let i = x/2 + y*16 + offset;
          if (y > 31 && y < 64){
            pixel = x+(y+32)*32;
          }else if(y > 63 && y < 96){
            pixel = x+(y-32)*32;
          }else{
            pixel = x+y*32;
          }
          ab[pixel++] = (this.dataBytes[i] & 0x0F);
          ab[pixel++] = ((this.dataBytes[i] >> 4) & 0x0F);
        }
      }
    }else{
      for (let i = offset; i < this.b.byteLength-3 && pixel < ab.byteLength; i++){
        ab[pixel++] = (this.dataBytes[i] & 0x0F);
        ab[pixel++] = ((this.dataBytes[i] >> 4) & 0x0F);
      }
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

  ///Writes passed ArrayBuffer of palette indexes to the ACNH structure
  fromPixels(ab){
    let offset = 0xA5;
    let pixel = 0;
    if (this.b.byteLength > 680){
      for (let x = 0; x < 32; x+=2){
        for (let y = 0; y < 128; ++y){
          let i = x/2 + y*16 + offset;
          if (y > 31 && y < 64){
            pixel = x+(y+32)*32;
          }else if(y > 63 && y < 96){
            pixel = x+(y-32)*32;
          }else{
            pixel = x+y*32;
          }
          this.dataBytes[i] = (ab[pixel] & 0x0F) + ((ab[pixel+1] & 0x0F) << 4);
        }
      }
    }else{
      for (let i = offset; i < this.b.byteLength-3; i++){
        this.dataBytes[i] = (ab[pixel] & 0x0F) + ((ab[pixel+1] & 0x0F) << 4);
        pixel += 2;
      }
    }
  }

  getPalette(i){
    if (i < 0 || i > 14){return null;}
    return [this.dataBytes[0x78 + i*3], this.dataBytes[0x78 + i*3 + 1], this.dataBytes[0x78 + i*3 + 2]];
  }
  
  setPalette(i, newVal){
    if (i < 0 || i > 14){return;}
    this.dataBytes[0x78 + i*3 + 0] = newVal[0];
    this.dataBytes[0x78 + i*3 + 1] = newVal[1];
    this.dataBytes[0x78 + i*3 + 2] = newVal[2];
  }

  set title(newTitle){this.utf16_encode(0x10, 40, newTitle);};
  get title(){return this.utf16_decode(0x10, 40);};
  set creator(n){
    if (n instanceof Array && n.length == 2){this.creator = n[0]; this.creator = n[1]; return;}
    if ((typeof n) == "string"){this.utf16_encode(0x58, 20, n);}
    if ((typeof n) == "number"){this.dataView.setUint32(0x54, n, true);}
  };
  get creator(){
    return [this.utf16_decode(0x58, 20), this.dataView.getUint32(0x54, true)];
  };
  set town(n){
    if (n instanceof Array && n.length == 2){this.town = n[0]; this.town = n[1]; return;}
    if ((typeof n) == "string"){this.utf16_encode(0x3C, 20, n);}
    if ((typeof n) == "number"){this.dataView.setUint32(0x38, n, true);}
  };
  get town(){
    return [this.utf16_decode(0x3C, 20), this.dataView.getUint32(0x38, true)];
  };
  setDefaultPalette(){
    for (let i = 0; i < 15; i++){this.setPalette([i*17, i*17, i*17]);}
  };
  /*
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
  */
  get patternType(){
    return this.dataBytes[this.dataBytes.byteLength-3];
  };
  static getTypeStr(val){
    return "Unimplemented pattern type";
  };
  get width(){
    return ACNHFormat.typeInfo[this.patternType].size;
  }
  get height(){
    return ACNHFormat.typeInfo[this.patternType].size;
  }
  get texWidth(){
    return ACNHFormat.typeInfo[this.patternType].texSize;
  }
  get texHeight(){
    return ACNHFormat.typeInfo[this.patternType].texSize;
  }
  get byteLength(){
    return this.dataBytes.byteLength;
  }
  ///Returns FNV-1a 128-bit hash of the pixel data only
  pixelHash(){
    return fnv1a128(this.b, 0x78, (this.width > 32) ? (45+512*4) : (45+512));
  }
  ///Returns FNV-1a 128-bit hash of the whole pattern
  fullHash(){
    return fnv1a128(this.b, 0, this.byteLength);
  }
  static widthForType(t){
    return ACNHFormat.typeInfo[t].size;
  }
  static texWidthForType(t){
    return ACNHFormat.typeInfo[t].texSize;
  }
  static bytesForType(t){
    return ACNHFormat.texWidthForType(t) > 32 ? 2216 : 680;
  }
  static slidersToColor(hIn, sIn, vIn){
    const s = Sinc*sIn/100.0;
    const v = (Vstart+Vinc*vIn)/100.0;
    const C = v*s;
    const h = hIn/5;
    const X = C*(1.0-Math.abs((h%2)-1.0));
    let r, g, b;
    r=g=b=v-C;
    if(h<1){
      r += C; g += X;
    }else if(h<2){
      r += X; g += C;
    }else if(h<3){
      g += C; b += X;
    }else if(h<4){
      g += X; b += C;
    }else if(h<5){
      r += X; b += C;
    }else{
      r += C; b += X;
    }
    r = Math.round(r*255);
    g = Math.round(g*255);
    b = Math.round(b*255);
    let hex = (r*65536+g*256+b).toString(16,6);
    while(hex.length<6) hex = '0'+hex;
    return hex.toUpperCase();
  }
  static colorToSliders(r,g,b){
    if (typeof r == "string" && r.length == 7 && r.substr(0, 1) == 1){r = r.substr(1);}
    if (typeof r == "string" && r.length == 6){
      g = parseInt(r.substring(2,4), 16);
      b = parseInt(r.substring(4,6), 16);
      r = parseInt(r.substring(0,2), 16);
    }
    r/=255;
    g/=255;
    b/=255;
    const M = Math.max(r,g,b);
    const m = Math.min(r,g,b);
    const C = M-m;
    let h = 0;
    if (!C){
      h=0;
    }else if(M==r){
      h=((g-b)/C)%6;
    }else if(M==g){
      h=(b-r)/C+2;
    }else{
      h=(r-g)/C+4;
    }
    if (h<0){h+=6;}
    const s=((!M)?0:(C/M))*100;
    const v = M*100;
    return [Math.round(h*5), Math.round(s/Sinc), Math.round((v-Vstart)/Vinc)];
  }
};

//General info about the various types of patterns in ACNL
//Masks define areas that cannot be drawn to (true = masked, false = normal).
//Masks use a compact notation of 32-bit masks, otherwise we'd have a giant list of true/false here.
ACNHFormat.typeInfo = [];

ACNHFormat.typeInfo[0x00] = {name:"Plain Pattern (ACNH)", size:32, texSize:32, sections:[0, 0, 32, 32]};
ACNHFormat.typeInfo[0x01] = {name:"Pro Pattern (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x02] = {name:"Tank top (ACNH, non-pro)", size:32, texSize:64, sections:[0, 0, 32, 32]};
ACNHFormat.typeInfo[0x03] = {name:"Long sleeve dress shirt (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x04] = {name:"Short sleeve tee (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x05] = {name:"Tank top (ACNH, pro)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x06] = {name:"Sweater (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x07] = {name:"Hoodie (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x08] = {name:"Coat (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x09] = {name:"Short sleeve dress (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x0A] = {name:"Sleeveless dress (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x0B] = {name:"Long sleeve dress (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x0C] = {name:"Balloon hem dress (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x0D] = {name:"Round dress (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x0E] = {name:"Robe (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x0F] = {name:"Brimmed cap (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x10] = {name:"Knit cap (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x11] = {name:"Brimmed hat (ACNH)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x12] = {name:"Unknown 1 (ACNL)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x13] = {name:"Long sleeve dress (ACNL)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x14] = {name:"Unknown 2 (ACNL)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x15] = {name:"Unknown 3 (ACNL)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x16] = {name:"unKnown 4 (ACNL)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x17] = {name:"Sleeveless shirt (ACNL)", size:64, texSize:64, sections:[0, 0, 64, 64]};
ACNHFormat.typeInfo[0x18] = {name:"Hat (ACNL)", size:32, texSize:32, sections:[0, 0, 32, 32]};

export default ACNHFormat;

