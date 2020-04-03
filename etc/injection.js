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
  const compressed = LZString.compress(buffer.toString("binary"));
  return compressed;
};

const loadDaeFolder = (dirName) => {
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
const dress_half = loadGltf("dress_half.gltf");
const dress_long = loadGltf("dress_long.gltf");
const dress_none = loadGltf("dress_none.gltf");
const shirt_half = loadGltf("shirt_half.gltf");
const shirt_long = loadGltf("shirt_long.gltf");
const shirt_none = loadGltf("shirt_none.gltf");

//Easel
const easel = loadGltf("easel.gltf");

//Hats (ACNL)
const hat = loadGltf("hat.gltf");
const hornhat = loadGltf("hornhat.gltf");

//Hats {ACNH}
const brimmed_cap = loadGltf("brimmed_cap.gltf");
const brimmed_hat = loadGltf("brimmed_hat.gltf");
const knit_cap = loadGltf("knit_cap.gltf");

//ACNH clothing
const dress_acnh_short = loadGltf("dress_acnh_short.gltf");
const dress_acnh_long = loadGltf("dress_acnh_long.gltf");
const dress_acnh_none = loadGltf("dress_acnh_none.gltf");
const dress_round = loadGltf("dress_round.gltf");
const dress_balloon = loadGltf("dress_balloon.gltf");
const robe = loadGltf("robe.gltf");
const tank_pro = loadGltf("tank_pro.gltf");
const tank_simp = loadGltf("tank_simp.gltf");
const tee_short = loadGltf("tee_short.gltf");
const dressshirt_long = loadGltf("dressshirt_long.gltf");
const sweater = loadGltf("sweater.gltf");
const coat = loadGltf("coat.gltf");

// fbx test
const easel_folder = loadDaeFolder("easel");

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
  coat,

  easel_folder
}

