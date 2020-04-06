const fs = require('fs');
const path = require('path');
const LZString = require('lz-string');
const {
  pathToInjected
} = require("./paths");
const {
  forAllFilesIn
} = require("./utils");

const loadGltf = (fileName) => {
  const loc = path.resolve(pathToInjected, fileName);
  const buffer = fs.readFileSync(loc);
  // json types typically encoded in this format
  return JSON.parse(buffer.toString("utf-8"));
};

const loadAsset = (fileName) => {
  const loc = path.resolve(pathToInjected, fileName);
  const buffer = fs.readFileSync(loc);
  // inject using base64, save file size
  const compressed = LZString.compressToUTF16(buffer.toString("binary"));
  return compressed;
};

const loadFolder = (dirName) => {
  const loc = path.resolve(pathToInjected, dirName);
  // absolute file paths
  const assetFiles = new Set();
  forAllFilesIn(loc, (filePath) => {
    assetFiles.add(filePath);
  });

  // only performs corrections one level deep
  // to be fixed later, lazy atm
  let compressedFiles = {};
  for (let absPath of assetFiles.values()) {
    let fileName = absPath.replace(/^.*[\\\/]/, '');
    const compressed = loadAsset(absPath);
    compressedFiles[fileName] = compressed;
  };
  return compressedFiles;
  // { filename: compressedFile }
};

//Clothing stand
const clothing_stand = loadGltf("clothing_stand.gltf");

// ACNNL clothing
const dress_half = loadFolder("dress_half");
const dress_long = loadFolder("dress_long");
const dress_none = loadFolder("dress_none");
const shirt_half = loadFolder("shirt_half");
const shirt_long = loadFolder("shirt_long");
const shirt_none = loadFolder("shirt_none");

//Easel
const easel = loadFolder("easel");

//Hats (ACNL)
const hat = loadFolder("hat");
const hornhat = loadFolder("hornhat");

//Hats {ACNH}
const brimmed_cap = loadFolder("brimmed_cap");
const brimmed_hat = loadFolder("brimmed_hat");
const knit_cap = loadFolder("knit_cap");

//ACNH clothing
const dress_acnh_short = loadFolder("dress_acnh_short");
const dress_acnh_long = loadFolder("dress_acnh_long");
const dress_acnh_none = loadFolder("dress_acnh_none");
const dress_round = loadFolder("dress_round");
const dress_balloon = loadFolder("dress_balloon");
const robe = loadFolder("robe");
const tank_pro = loadFolder("tank_pro");
const tank_simp = loadFolder("tank_simp");
const tee_short = loadFolder("tee_short");
const dressshirt_long = loadFolder("dressshirt_long");
const sweater = loadFolder("sweater");
const hoodie = loadFolder("hoodie");
const coat = loadFolder("coat");


module.exports = {
  clothing_stand,
  dress_half,
  dress_long,
  dress_none,
  shirt_half,
  shirt_long,
  shirt_none,
  easel,
  hat,
  hornhat,
  brimmed_cap,
  brimmed_hat,
  knit_cap,
  dress_acnh_short,
  dress_acnh_long,
  dress_acnh_none,
  dress_round,
  dress_balloon,
  robe,
  tank_pro,
  tank_simp,
  tee_short,
  dressshirt_long,
  sweater,
  hoodie,
  coat,
}

