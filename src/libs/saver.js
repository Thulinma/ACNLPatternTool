import JSZip from "jszip";
import { saveAs } from "file-saver";
import generateACNLQR from "/libs/ACNLQRGenerator";

const saveDrawingToolAsAcnl = async (drawingTool) => {
  const blob = new Blob([drawingTool.toBytes()], { type: "application/octet-stream" });
  saveAs(blob, `${drawingTool.title}.acnl`);
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
    zip.file(`${filename}.acnl`, drawingTool.toBytes());
  }
  const zipFile = await zip.generateAsync({type: "blob"});
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
    zip.file(`${filename}.png`, img.substr(22), { base64:true });
  }
  const zipFile = await zip.generateAsync({type: "blob"});
  saveAs(zipFile, "patterns.zip");
};


const saveDrawingToolAsBoth = async (drawingTool) => {
  saveDrawingToolAsAcnl(drawingTool);
  saveDrawingToolAsPng(drawingTool);
};

const saveDrawingToolsAsBoth = async (drawingTools) => {
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
    zip.file(`${filename}.acnl`, drawingTool.toBytes());
    zip.file(`${filename}.png`, img.substr(22), { base64:true });
  }
  const zipFile = await zip.generateAsync({type: "blob"});
  saveAs(zipFile, "patterns.zip");
};

export default {
  saveDrawingToolAsAcnl,
  saveDrawingToolsAsAcnl,
  saveDrawingToolAsPng,
  saveDrawingToolsAsPng,
  saveDrawingToolAsBoth,
  saveDrawingToolsAsBoth,
};