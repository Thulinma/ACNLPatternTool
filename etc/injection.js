const fs = require('fs');
const path = require('path');
const {
  pathToInjected
} = require("./paths");

const loadGLTF = (fileName) => {
  const loc = path.resolve(pathToInjected, fileName);
  const buffer = fs.readFileSync(loc);
  return JSON.parse(buffer.toString());
}

//Clothing stand
const clothing_stand = loadGLTF("clothing_stand.gltf");

// ACNNL clothing
const dress_half = loadGLTF("dress_half.gltf");
const dress_long = loadGLTF("dress_long.gltf");
const dress_none = loadGLTF("dress_none.gltf");
const shirt_half = loadGLTF("shirt_half.gltf");
const shirt_long = loadGLTF("shirt_long.gltf");
const shirt_none = loadGLTF("shirt_none.gltf");

//Easel
const easel = loadGLTF("easel.gltf");

//Hats (ACNL)
const hat = loadGLTF("hat.gltf");
const hornhat = loadGLTF("hornhat.gltf");

//Hats {ACNH}
const brimmed_cap = loadGLTF("brimmed_cap.gltf");
const brimmed_hat = loadGLTF("brimmed_hat.gltf");
const knit_cap = loadGLTF("knit_cap.gltf");

//ACNH clothing
const dress_acnh_short = loadGLTF("dress_acnh_short.gltf");
const dress_acnh_long = loadGLTF("dress_acnh_long.gltf");
const dress_acnh_none = loadGLTF("dress_acnh_none.gltf");
const dress_round = loadGLTF("dress_round.gltf");
const dress_balloon = loadGLTF("dress_balloon.gltf");
const robe = loadGLTF("robe.gltf");
const tank_pro = loadGLTF("tank_pro.gltf");
const tank_simp = loadGLTF("tank_simp.gltf");
const tee_short = loadGLTF("tee_short.gltf");
const dressshirt_long = loadGLTF("dressshirt_long.gltf");
const sweater = loadGLTF("sweater.gltf");
const coat = loadGLTF("coat.gltf");

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
}

