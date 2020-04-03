const fs = require('fs');
const path = require('path');

// depth first search
const forAllFilesIn = (startPath, callback) => {
  if (!fs.existsSync(startPath)) return;
  if (!fs.lstatSync(startPath).isDirectory())
    if (callback) callback(startPath);

  const files = fs.readdirSync(startPath);
  for (const file of files) {
    const filepath = path.resolve(startPath, file);
    const stat = fs.lstatSync(filepath);
    if (stat.isDirectory()) {
      forAllFilesIn(filepath, callback);
      continue;
    }
    // is a file
    if (callback) callback(filepath);
  }
}

module.exports = {
  forAllFilesIn,
};