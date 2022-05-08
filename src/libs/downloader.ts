import JSZip from "jszip";
import { saveAs } from "file-saver";
import DrawingTool from "@/libs/DrawingTool";
import generateACNLQR from "./ACNLQRGenerator";
import generateACNHPBL from "./ACNHPBLGenerator";


/**
 * Interroppable interface to flexibly save as single or in zip.
 */
export interface NamedBlob {
  name: string,
  blob: Blob,
};


export const drawingToolToNamedPatternBlob = async (
  drawingTool: DrawingTool,
  name: string = `${drawingTool.title}.${drawingTool.compatMode.toLowerCase()}`,
): Promise<NamedBlob> => {
  const blob = new Blob(
    [drawingTool.toBytes()],
    { type: "application/octet-stream" },
  );
  return {
    name,
    blob,
  };
};


type DataUrlGen = (drawingTool: DrawingTool) => Promise<string>;
const modeToDataUrlGen = new Map<string, DataUrlGen>([
  ["acnl", generateACNLQR],
  ["acnh", generateACNHPBL],
]);
export const drawingToolToNamedImageBlob = async (
  drawingTool: DrawingTool,
  name: string = `${drawingTool.title}.png`,
): Promise<NamedBlob> => {
  const dataUrl = await (
    (modeToDataUrlGen.get(drawingTool.compatMode.toLowerCase()) as DataUrlGen)
    (drawingTool)
  );
  const blob = await (await fetch(dataUrl)).blob();
  return {
    name,
    blob,
  };
};


export const namedBlobsToNamedZipBlob = async (
  namedBlobs: NamedBlob[],
  name: string = "patterns.zip",
): Promise<NamedBlob> => {
  const nameUsage = new Map<string, number>();
  const zip = new JSZip();
  for (const { name, blob } of namedBlobs) {
    if (nameUsage.has(name)) {
      nameUsage.set(name, nameUsage.get(name) as number + 1);
      zip.file(`${name} (${nameUsage.get(name)})`, blob);
    }
    else {
      nameUsage.set(name, 0); // copies start at 1
      zip.file(name, blob);
    }
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return {
    name,
    blob,
  };
};


export const downloadNamedBlob = async (
  { name, blob }: NamedBlob,
): Promise<void> => {
  saveAs(blob, name);
};
