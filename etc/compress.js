const fs = require("fs");
const fse = require("fs-extra");
const path = require('path');
const zlib = require("zlib");
const stream = require("stream");
const {
  forAllFilesIn
} = require("./utils");

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