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
// 0x07 = Plain pattern (hat)
// 0x08 = Standee (pro)
// 0x09 = Plain pattern (easel)

class ACNLFormat{
  ///Either transfers an existing ArrayBuffer, of creates a new pattern, optionally using the passed pattern type.
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

    //No pattern yet? Let's create one based on the create_pat_type type.
    if (this.b === null){
      //If we're creating new patterns, make them easel-type, unless our argument was a number, then use that type number.
      let create_pat_type = 9;//easel
      if ((typeof qr_buffer) == "number"){create_pat_type = qr_buffer;}
      this.b = new ArrayBuffer((create_pat_type < 6 || create_pat_type == 8) ? 2160 : 620);
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

  }

  ///UTF16 decode helper
  utf16_decode(offset, len){
    var tmp = "";
    for (var i = 0; i < len; i += 2){
      var nextChar = this.dataView.getUint16(offset+i, true);
      if (nextChar == 0){return tmp;}
      tmp += String.fromCharCode(nextChar);
    }
    return tmp;
  };

  ///UTF16 encode helper
  utf16_encode(offset, len, str){
    for (var i = 0; i < len/2; i++){
      if (i >= str.length){
        this.dataView.setUint16(offset+i*2, 0, true);
      }else{
        this.dataView.setUint16(offset+i*2, str.charCodeAt(i), true);
      }
    }
  };

  ///Decodes a raw pattern to internal JSON format
  toJSON(b){
    var r = {
      title: this.title,
      author: [this.creator, this.town],
      unknown: {
        A: this.unknown_a,
        B: this.unknown_b,
        C: this.unknown_c,
        D: this.unknown_d
      },
      texture_size: (this.b.byteLength > 620 ? 64 : 32),
      pattern_type: this.patternType,
      pattern_type_str: ACNLFormat.getTypeStr(this.patternType),
    };
    return r;
  }

  ///Writes the ACNL pattern structure to the passed ArrayBuffer object as an array of palette indexes
  toPixels(ab){
    let offset = 0x6C;
    let pixel = 0;
    for (let i = offset; i < this.b.byteLength; i++){
      ab[pixel++] = (this.dataBytes[i] & 0x0F);
      ab[pixel++] = ((this.dataBytes[i] >> 4) & 0x0F);
    }
  }

  ///Writes passed ArrayBuffer of palette indexes to the ACNL structure
  fromPixels(ab){
    let offset = 0x6C;
    let pixel = 0;
    for (let i = offset; i < this.b.byteLength; i++){
      this.dataBytes[i] = (ab[pixel] & 0x0F) + ((ab[pixel+1] & 0x0F) << 4);
    }
  }

  ///Returns a blank pattern in raw format
  static createBlankPattern(pattern_type){
    var buffer;
  };


  set title(newTitle){this.utf16_encode(0, 42, newTitle);};
  get title(){return this.utf16_decode(0, 42);};
  set creator([newCreator, newCreatorID]){
    this.dataView.setUint16(0x2A, newCreatorID, true);
    this.utf16_encode(0x2C, 20, newCreator);
  };
  get creator(){
    return [this.utf16_decode(0x2C, 20), this.dataView.getUint16(0x2A, true)];
  };
  set town([newTown, newTownID]){
    this.dataView.setUint16(0x40, newTownID, true);
    this.utf16_encode(0x42, 20, newTown);
  };
  get town(){
    return [this.utf16_decode(0x42, 20), this.dataView.getUint16(0x40, true)];
  };
  set unknown_a(newVal){
    this.dataView.setUint16(0x56, newVal, true);
  };
  get unknown_a(){
    return this.dataView.getUint16(0x56, true);
  };
  setDefaultPalette(){
    this.dataBytes[0x58 +  1] = 0x0F;
    this.dataBytes[0x58 +  1] = 0x1F;
    this.dataBytes[0x58 +  2] = 0x2F;
    this.dataBytes[0x58 +  3] = 0x3F;
    this.dataBytes[0x58 +  4] = 0x4F;
    this.dataBytes[0x58 +  5] = 0x5F;
    this.dataBytes[0x58 +  6] = 0x6F;
    this.dataBytes[0x58 +  7] = 0x7F;
    this.dataBytes[0x58 +  8] = 0x8F;
    this.dataBytes[0x58 +  9] = 0x9F;
    this.dataBytes[0x58 + 10] = 0xAF;
    this.dataBytes[0x58 + 11] = 0xBF;
    this.dataBytes[0x58 + 12] = 0xCF;
    this.dataBytes[0x58 + 13] = 0xDF;
    this.dataBytes[0x58 + 14] = 0xEF;
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
    this.dataBytes[0x69] = newVal;
  };
  get patternType(){
    return this.dataBytes[0x69];
  };
  static getTypeStr(val){
    switch (val){
      case 0: return "Long sleeves dress";
      case 1: return "Short sleeves dress";
      case 2: return "Sleeveless dress";
      case 3: return "Long sleeves shirt";
      case 4: return "Short sleeves shirt";
      case 5: return "Sleeveless shirt";
      case 7: return "Hat";
      case 8: return "Standee";
      case 9: return "Normal pattern (Easel)";
      default: return "Unimplemented pattern type";
    }
  };
  set unknown_d(newVal){
    this.dataView.setUint16(0x6A, newVal, true);
  };
  get unknown_d(){
    return this.dataView.getUint16(0x6A, true);
  };
};

ACNLFormat.prototype.paletteColors = [
  //Pinks (0x00 - 0x08)
  "#FFEFFF", "#FF9AAD", "#EF559C", "#FF65AD", "#FF0063", "#BD4573", "#CE0052", "#9C0031", "#522031",
  "","","","","","",//0x09-0x0E unused / unknown
  "#FFFFFF", //0x0F: Grey 1
  //Reds (0x10 - 0x18)
  "#FFBACE", "#FF7573", "#DE3010", "#FF5542", "#FF0000", "#CE6563", "#BD4542", "#BD0000", "#8C2021",
  "","","","","","",//0x19-0x1E unused / unknown
  "#ECECEC", //0x1F: Grey 2
  //Oranges (0x20 - 0x28)
  "#DECFBD", "#FFCF63", "#DE6521", "#FFAA21", "#FF6500", "#BD8A52", "#DE4500", "#BD4500", "#633010",
  "","","","","","",//0x29-0x2E unused / unknown
  "#DADADA", //0x2F: Grey 3
  //Pastels or something, I guess? (0x30 - 0x38)
  "#FFEFDE", "#FFDFCE", "#FFCFAD", "#FFBA8C", "#FFAA8C", "#DE8A63", "#BD6542", "#9C5531", "#8C4521",
  "","","","","","",//0x39-0x3E unused / unknown
  "#C8C8C8", //0x3F: Grey 4
  //Purple (0x40 - 0x48)
  "#FFCFFF", "#EF8AFF", "#CE65DE", "#BD8ACE", "#CE00FF", "#9C659C", "#8C00AD", "#520073", "#310042",
  "","","","","","",//0x49-0x4E unused / unknown
  "#B6B6B6", //0x4F: Grey 5
  //Pink (0x50 - 0x58)
  "#FFBAFF", "#FF9AFF", "#DE20BD", "#FF55EF", "#FF00CE", "#8C5573", "#BD009C", "#8C0063", "#520042",
  "","","","","","",//0x59-0x5E unused / unknown
  "#A3A3A3", //0x5F: Grey 6
  //Brown (0x60 - 0x68)
  "#DEBA9C", "#CEAA73", "#734531", "#AD7542", "#9C3000", "#733021", "#522000", "#311000", "#211000",
  "","","","","","",//0x69-0x6E unused / unknown
  "#919191", //0x6F: Grey 7
  //Yellow (0x70 - 0x78)
  "#FFFFCE", "#FFFF73", "#DEDF21", "#FFFF00", "#FFDF00", "#CEAA00", "#9C9A00", "#8C7500", "#525500",
  "","","","","","",//0x79-0x7E unused / unknown
  "#7F7F7F", //0x7F: Grey 8
  //Blue (0x80 - 0x88)
  "#DEBAFF", "#BD9AEF", "#6330CE", "#9C55FF", "#6300FF", "#52458C", "#42009C", "#210063", "#211031",
  "","","","","","",//0x89-0x8E unused / unknown
  "#6D6D6D", //0x8F: Grey 9
  //Ehm... also blue? (0x90 - 0x98)
  "#BDBAFF", "#8C9AFF", "#3130AD", "#3155EF", "#0000FF", "#31308C", "#0000AD", "#101063", "#000021",
  "","","","","","",//0x99-0x9E unused / unknown
  "#5B5B5B", //0x9F: Grey 10
  //Green (0xA0 - 0xA8)
  "#9CEFBD", "#63CF73", "#216510", "#42AA31", "#008A31", "#527552", "#215500", "#103021", "#002010",
  "","","","","","",//0xA9-0xAE unused / unknown
  "#484848", //0xAF: Grey 11
  //Icky greenish yellow (0xB0 - 0xB8)
  "#DEFFBD", "#CEFF8C", "#8CAA52", "#ADDF8C", "#8CFF00", "#ADBA9C", "#63BA00", "#529A00", "#316500",
  "","","","","","",//0xB9-0xBE unused / unknown
  "#363636", //0xBF: Grey 12
  //Wtf? More blue? (0xC0 - 0xC8)
  "#BDDFFF", "#73CFFF", "#31559C", "#639AFF", "#1075FF", "#4275AD", "#214573", "#002073", "#001042",
  "","","","","","",//0xC9-0xCE unused / unknown
  "#242424", //0xCF: Grey 13
  //Gonna call this cyan (0xD0 - 0xD8)
  "#ADFFFF", "#52FFFF", "#008ABD", "#52BACE", "#00CFFF", "#429AAD", "#00658C", "#004552", "#002031",
  "","","","","","",//0xD9-0xDE unused / unknown
  "#121212", //0xDF: Grey 14
  //More cyan, because we didn't have enough blue-like colors yet (0xE0 - 0xE8)
  "#CEFFEF", "#ADEFDE", "#31CFAD", "#52EFBD", "#00FFCE", "#73AAAD", "#00AA9C", "#008A73", "#004531",
  "","","","","","",//0xE9-0xEE unused / unknown
  "#000000", //0xEF: Grey 15
  //Also green. Fuck it, whatever. (0xF0 - 0xF8)
  "#ADFFAD", "#73FF73", "#63DF42", "#00FF00", "#21DF21", "#52BA52", "#00BA00", "#008A00", "#214521",
  "","","","","","",//0xF9-0xFE unused / unknown
  "", //0xFF unused (white in-game, editing freezes the game)
];

//export default ACNLFormat;

