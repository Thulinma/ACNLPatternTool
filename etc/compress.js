const fs = require("fs");
const fse = require("fs-extra");
const path = require('path');
const zlib = require("zlib");
const stream = require("stream");
const {
  pathToBuild
} = require("../etc/paths");

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

const compressFile = (filepath) => {
  const gzip = zlib.createGzip({
    level: 9,
  });
  const source = fs.createReadStream(filepath);
  const destination = fs.createWriteStream(`${filepath}.gz`);

  stream.pipeline(source, gzip, destination, (err) => {
    if (err) {
      console.log(error);
      process.exit(1);
    }
  });
};

const isCompressedRegEx = /.gz$/i;

// creates files
const create = (startPath) => {
  const filesToCompress = new Set();
  forAllFilesIn(startPath, (filepath) => {
    // only add files that need compression
    if (!(isCompressedRegEx.test(filepath)))
      filesToCompress.add(filepath);
  });
  for (let file of filesToCompress) {
    compressFile(file);
  }
};

// removes files
// select to remove compressed, uncompressed or all
const destroy = (startPath, compressed) => {
  const filesToRemove = new Set();
  if (compressed == null) {
    if (fs.existsSync(startPath))
      fse.removeSync(startPath);
  };
  forAllFilesIn(startPath, (filepath) => {
    const isCompressed = isCompressedRegEx.test(filepath);
    const doesMatch = compressed? isCompressed : !isCompressed;
    if (doesMatch)
      filesToRemove.add(filepath);
  });
  for (let file of filesToRemove)
    fse.removeSync(file);
};

module.exports = {
  create,
  destroy
};