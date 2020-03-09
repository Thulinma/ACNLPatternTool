const fs = require('fs');
const path = require('path');
const {
  pathToBuild
} = require('../etc/paths');

const removeUncompressedBuild = () => {
  // delete all files not .gzipped
  // delete original assets manually if stats was produced
  const recursiveDelete = (startPath, filter) => {
    if (!fs.existsSync(startPath)) return;
    const files = fs.readdirSync(startPath);
    for (const file of files) {
      const filename = path.join(startPath, file);
      const stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {
        recursiveDelete(filename, filter);
        continue;
      }

      if (filter.test(filename)) fs.unlinkSync(filename);
    }
  }
  // non-compressed formats, license formats
  recursiveDelete(pathToBuild, /.*\.(html|js|txt|gltf)$/i);
}

module.exports = {
  removeUncompressedBuild
}