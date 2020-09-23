import JSZip from "jszip";
import { saveAs } from "file-saver";
import generateACNLQR from "/libs/ACNLQRGenerator";
import lzString from "lz-string";
import DrawingTool from "/libs/DrawingTool";

const saveDrawingToolAsPattern = async (drawingTool) => {
  const blob = new Blob([drawingTool.toBytes()], { type: "application/octet-stream" });
  saveAs(blob, `${drawingTool.title}.${drawingTool.compatMode.toLowerCase()}`);
};

const saveDrawingToolsAsPattern = async (drawingTools) => {
  const zip = new JSZip();
  const usedFilenames = new Set();
  for (const drawingTool of drawingTools) {
    let filename = drawingTool.title;
    let id = 0;
    while (usedFilenames.has(filename)) {
      filename = `${drawingTool.title}(${++id})`;
    }
    usedFilenames.add(filename);
    zip.file(`${filename}.${drawingTool.compatMode.toLowerCase()}`, drawingTool.toBytes());
  }
  const zipFile = await zip.generateAsync({ type: "blob" });
  saveAs(zipFile, "patterns.zip");
};


const saveDrawingToolAsPng = async (drawingTool) => {
  const img = await generateACNLQR(drawingTool);
  saveAs(img, `${drawingTool.title}.png`);
};

const saveDrawingToolsAsPng = async (drawingTools) => {
  const zip = new JSZip();
  const usedFilenames = new Set();
  for (const drawingTool of drawingTools) {

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
  saveAs(zipFile, "patterns.zip");
};


const saveDrawingToolAsBoth = async (drawingTool) => {
  await saveDrawingToolAsPattern(drawingTool);
  await saveDrawingToolAsPng(drawingTool);
};

const saveDrawingToolsAsBoth = async (drawingTools, filenames) => {
  const zip = new JSZip();
  const usedFilenames = new Set();
  for (let i = 0; i < drawingTools.length; ++i) {
    const drawingTool = drawingTools[i];
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
  saveAs(zipFile, "patterns.zip");
};

// --- LOCAL STORAGE MODIFICATION MEHODS ---

/**
 * Saves patterns to local storage
 * @param {Array} drawingTools - An Array of DrawingTool instances
 */
const saveDrawingToolsToStorage = async (drawingTools) => {
  for (const drawingTool of drawingTools) {
    drawingTool.fixIssues();
    const hash = drawingTool.fullHash;
    let namespacePrefix;
    if (drawingTool.compatMode === "ACNL") namespacePrefix = "acnl_";
    else if (drawingTool.compatMode === "ACNH") namespacePrefix = "acnh_";
    else continue;
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