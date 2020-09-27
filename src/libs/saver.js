import JSZip from "jszip";
import generateACNLQR from "~/libs/ACNLQRGenerator";
import { saveAs } from "file-saver"; 
import lzString from "lz-string";
import DrawingTool from "~/libs/DrawingTool";

// RUN `saveAs` on per result on the return, loop over array
const saveDrawingToolAsPattern = async (drawingTool) => {
  drawingTool.fixIssues();
  drawingTool.toString();
  const blob = new Blob([drawingTool.toBytes()], { type: "application/octet-stream" });

  const content = blob;
  const filename = `${drawingTool.title}.${drawingTool.compatMode.toLowerCase()}`;
  saveAs(content, filename);
};

const saveDrawingToolsAsPattern = async (drawingTools) => {
  const zip = new JSZip();
  const usedFilenames = new Set();
  for (const drawingTool of drawingTools) {
    drawingTool.fixIssues();
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


const saveDrawingToolAsPng = async (drawingTool) => {  
  drawingTool.fixIssues();
  drawingTool.toString();
  const img = await generateACNLQR(drawingTool);
  const content = img;
  const filename = `${drawingTool.title}.png`;
  saveAs(content, filename);
};

const saveDrawingToolsAsPng = async (drawingTools) => {
  const zip = new JSZip();
  const usedFilenames = new Set();
  for (const drawingTool of drawingTools) {
    drawingTool.fixIssues();
    drawingTool.toString();
    const img = await generateACNLQR(drawingTool);
    
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


const saveDrawingToolAsBoth = async (drawingTool) => {
  drawingTool.fixIssues();
  drawingTool.toString();
  const zip = new JSZip();
  zip.file(`${drawingTool.title}.${drawingTool.compatMode.toLowerCase()}`, drawingTool.toBytes());
  const img = await generateACNLQR(drawingTool);
  zip.file(`${drawingTool.title}.png`, img.substr(22), { base64: true });
  const zipFile = await zip.generateAsync({ type: "blob" });
  const content = zipFile;
  const filename = `${drawingTool.title}.zip`;
  saveAs(content, filename);
};

const saveDrawingToolsAsBoth = async (drawingTools, filenames) => {
  const zip = new JSZip();
  const usedFilenames = new Set();
  for (let i = 0; i < drawingTools.length; ++i) {
    const drawingTool = drawingTools[i];
    drawingTool.fixIssues();
    drawingTool.toString();      
    const img = await generateACNLQR(drawingTool);
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
    drawingTool.fixIssues();
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
    drawingTool.fixIssues();
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