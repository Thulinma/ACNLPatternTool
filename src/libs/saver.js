import JSZip from "jszip";
import generateACNLQR from "~/libs/ACNLQRGenerator";
import generateACNHPBL from "~/libs/ACNHPBLGenerator";
import { saveAs } from "file-saver"; 
import lzString from "lz-string";
import DrawingTool from "~/libs/DrawingTool";

/**
 * Saves a single drawing tool as native file pattern.
 * @param {DrawingTool} drawingTools 
 */
const saveDrawingToolAsPattern = async (drawingTool) => {
  drawingTool.toString();
  const blob = new Blob([drawingTool.toBytes()], { type: "application/octet-stream" });

  const content = blob;
  const filename = `${drawingTool.title}.${drawingTool.compatMode.toLowerCase()}`;
  saveAs(content, filename);
};

/**
 * Saves multiple drawing tools as native file pattern.
 * Fixes file names if there are duplicates.
 * @param {Array} drawingTools 
 */
const saveDrawingToolsAsPattern = async (drawingTools) => {
  const zip = new JSZip();
  const usedFilenames = new Set();
  for (const drawingTool of drawingTools) {
    drawingTool.toString();
    let filename = drawingTool.title;
    let id = 0;
    while (usedFilenames.has(filename)) {
      filename = `${drawingTool.title}(${++id})`;
    }
    usedFilenames.add(filename);
    zip.file(`${filename}.${drawingTool.compatMode.toLowerCase()}`, drawingTool.toBytes());
  }
  const zipFile = await zip.generateAsync({ type: "blob" });

  const content = zipFile;
  const filename = "patterns.zip";
  saveAs(content, filename);
};

/**
 * Saves a single drawing tool as PNGS (QR/PBL).
 * @param {DrawingTool} drawingTool
 */
const saveDrawingToolAsPng = async (drawingTool) => {  
  drawingTool.toString();
  let img;
  if (drawingTool.compatMode === "ACNL")
    img = await generateACNLQR(drawingTool);
  else if (drawingTool.compatMode === "ACNH")
    img = await generateACNHPBL(drawingTool);
  else {
    throw new TypeError(`PNG for AC pattern not implemented`);
  }
  const content = img;
  const filename = `${drawingTool.title}.png`;
  saveAs(content, filename);
};

/**
 * Saves multiple drawing tools as PNGS (QR/PBL).
 * Fixes file names if there are duplicates.
 * @param {Array} drawingTools 
 */
const saveDrawingToolsAsPng = async (drawingTools) => {
  const zip = new JSZip();
  const usedFilenames = new Set();
  for (const drawingTool of drawingTools) {
    drawingTool.toString();
    let img;
    if (drawingTool.compatMode === "ACNL")
      img = await generateACNLQR(drawingTool);
    else if (drawingTool.compatMode === "ACNH")
      img = await generateACNHPBL(drawingTool);
    else {
      throw new TypeError(`PNG for AC pattern not implemented`);
    }
    let filename = drawingTool.title;
    
    let id = 0;
    while (usedFilenames.has(filename)) {
      filename = `${drawingTool.title}(${++id})`;
    }
    usedFilenames.add(filename);
    zip.file(`${filename}.png`, img.substr(22), { base64: true });
  }
  const zipFile = await zip.generateAsync({ type: "blob" });

  const content = zipFile;
  const filename = "patterns.zip";
  saveAs(content, filename);
};

/**
 * Saves a single drawing tool as PNGS (QR/PBL) and native file pattern.
 * @param {DrawingTool} drawingTool
 */
const saveDrawingToolAsBoth = async (drawingTool) => {
  drawingTool.toString();
  const zip = new JSZip();
  zip.file(`${drawingTool.title}.${drawingTool.compatMode.toLowerCase()}`, drawingTool.toBytes());
  let img;
  if (drawingTool.compatMode === "ACNL")
    img = await generateACNLQR(drawingTool);
  else if (drawingTool.compatMode === "ACNH")
    img = await generateACNHPBL(drawingTool);
  else {
    throw new TypeError(`PNG for AC pattern not implemented`);
  }  
  zip.file(`${drawingTool.title}.png`, img.substr(22), { base64: true });
  const zipFile = await zip.generateAsync({ type: "blob" });
  const content = zipFile;
  const filename = `${drawingTool.title}.zip`;
  saveAs(content, filename);
};

/**
 * Saves multiple drawing tools as PNGS (QR/PBL) and native file pattern.
 * Fixes file names if there are duplicates.
 * @param {Array} drawingTools 
 */
const saveDrawingToolsAsBoth = async (drawingTools) => {
  const zip = new JSZip();
  const usedFilenames = new Set();
  for (let i = 0; i < drawingTools.length; ++i) {
    const drawingTool = drawingTools[i];
    drawingTool.toString();
    let img;
    if (drawingTool.compatMode === "ACNL")
      img = await generateACNLQR(drawingTool);
    else if (drawingTool.compatMode === "ACNH")
      img = await generateACNHPBL(drawingTool);
    else {
      throw new TypeError(`PNG for AC pattern not implemented`);
    }
    let filename = drawingTool.title;
    let id = 0;
    while (usedFilenames.has(filename)) {
      filename = `${drawingTool.title}(${++id})`;
    }
    usedFilenames.add(filename);
    zip.file(`${filename}.${drawingTool.compatMode.toLowerCase()}`, drawingTool.toBytes());
    zip.file(`${filename}.png`, img.substr(22), { base64: true });
  }
  const zipFile = await zip.generateAsync({ type: "blob" });

  const content = zipFile;
  const filename = "patterns.zip";
  saveAs(content, filename);
};

// --- LOCAL STORAGE MODIFICATION MEHODS ---

/**
 * Saves patterns to local storage
 * @param {Array} drawingTools - An Array of DrawingTool instances
 */
const saveDrawingToolsToStorage = async (drawingTools) => {
  for (const drawingTool of drawingTools) {
    let namespacePrefix;
    if (drawingTool.compatMode === "ACNL") namespacePrefix = "acnl_";
    else if (drawingTool.compatMode === "ACNH") namespacePrefix = "acnh_";
    else continue;
    drawingTool.toString();
    const hash = drawingTool.fullHash;
    localStorage.setItem(
      `${namespacePrefix}${hash}`,
      lzString.compressToUTF16(drawingTool.toString()),
    );
  }
};

/**
 * Gets all patterns from local storage
 * @returns {Array} - an Array of DrawingTool intances
 */
const getDrawingToolsFromStorage = async () => {
  const drawingTools = [];
  for (let i = 0; i < localStorage.length; ++i) {
    const key = localStorage.key(i);
    if (key.startsWith("acnl_") || key.startsWith("acnh_")) {
      const fromStorage = new DrawingTool(
        lzString.decompressFromUTF16(localStorage.getItem(key))
      );
      drawingTools.push(fromStorage);
    };
  }
  return drawingTools;
};

/**
 * Deletes patterns from local storage
 * @param {Array} drawingTools - An Array of DrawingTool instances
 */
const deleteDrawingToolsFromStorage = async (drawingTools) => {
  for (const drawingTool of drawingTools) {
    let namespacePrefix;
    if (drawingTool.compatMode === "ACNL") namespacePrefix = "acnl_";
    else if (drawingTool.compatMode === "ACNH") namespacePrefix = "acnh_";
    drawingTool.toString();
    localStorage.removeItem(`${namespacePrefix}${drawingTool.fullHash}`);
  }
};


export default {
  saveDrawingToolAsPattern,
  saveDrawingToolsAsPattern,
  saveDrawingToolAsPng,
  saveDrawingToolsAsPng,
  saveDrawingToolAsBoth,
  saveDrawingToolsAsBoth,
  saveDrawingToolsToStorage,
  getDrawingToolsFromStorage,
  deleteDrawingToolsFromStorage,
};