import JSZip from "jszip";
import { saveAs } from "file-saver";
import generateACNLQR from "/libs/ACNLQRGenerator";
import lzString from "lz-string";

const saveDrawingToolAsAcnl = async (drawingTool) => {
  const blob = new Blob([drawingTool.toBytes()], { type: "application/octet-stream" });
  saveAs(blob, `${drawingTool.title}.${drawingTool.compatMode.toLowerCase()}`);
};

const saveDrawingToolsAsAcnl = async (drawingTools) => {
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
  saveDrawingToolAsAcnl(drawingTool);
  saveDrawingToolAsPng(drawingTool);
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

const saveDrawingToolToStorage = async (drawingTool) => {
  drawingTool.fixIssues();
  const hash = drawingTool.fullHash;
  localStorage.setItem(
    "acnl_" + hash,
    lzString.compressToUTF16(drawingTool.toString()),
  );
};

const saveDrawingToolsToStorage = async (drawingTools) => {
  for (const drawingTool of drawingTools) {
    saveDrawingToolToStorage(drawingTool);
  }
};


export default {
  saveDrawingToolAsAcnl,
  saveDrawingToolsAsAcnl,
  saveDrawingToolAsPng,
  saveDrawingToolsAsPng,
  saveDrawingToolAsBoth,
  saveDrawingToolsAsBoth,
  saveDrawingToolToStorage,
  saveDrawingToolsToStorage,
};