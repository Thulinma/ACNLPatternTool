const fs = require('fs');
const path = require('path');
const {
  pathToInjected
} = require("./paths");


const loadGLTF = (fileName) => {
  const loc = path.resolve(pathToInjected, fileName);
  const buffer = fs.readFileSync(loc);
  return JSON.parse(buffer.toString())
}

const dress_half = loadGLTF("dress_half.gltf");
const dress_long = loadGLTF("dress_long.gltf");
const dress_none = loadGLTF("dress_none.gltf");
const shirt_half_nrml = loadGLTF("shirt_half_nrml.gltf");
const shirt_half = loadGLTF("shirt_half.gltf");
const shirt_long = loadGLTF("shirt_long.gltf");
const shirt_none = loadGLTF("shirt_none.gltf");

module.exports = {
  dress_half,
  dress_long,
  dress_none,
  shirt_half_nrml,
  shirt_half,
  shirt_long,
  shirt_none,
}