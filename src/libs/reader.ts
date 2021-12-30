import * as JSZip from "jszip";
import DrawingTool from "@/libs/DrawingTool";
import {
  ResultMetadataType,
  DecodeHintType,
} from "@zxing/library/esm";
import {
  AcBrowserQRCodeReader as BrowserQRCodeReader,
} from "@/libs/acZxing";


const ui8ToDt = (ui8: Uint8Array): DrawingTool => {
  const dt = new DrawingTool();
  dt.load(ui8);
  return dt;
};

export const patternExts = [".acnh", ".acnl"];
export const readPatternFiles = async (blobs: Blob[]): Promise<DrawingTool[]> => {
  const drawingTools = [];
  for (const blob of blobs) {
    const fileReader = new FileReader();
    const arrayBuffer = await new Promise<ArrayBuffer>(resolve => {
      fileReader.onload = event => resolve(event.target.result as ArrayBuffer);
      fileReader.readAsArrayBuffer(blob);
    });
    drawingTools.push(ui8ToDt(new Uint8Array(arrayBuffer)));
  }
  return drawingTools;
};


export const qrImageExts = [".png", ".jpg", ".jpeg", ".gif", ".bmp"];
export const readQrImageFiles = async (blobs: Blob[]): Promise<DrawingTool[]> => {
  interface ExtractedResult {
    bytes: Uint8Array;
    sequenceNumber: number;
    parity: number; // number to check to make sure qr parts are from same data
  };
  // break it down into singular codes
  // supports multiload
  const drawingTools: DrawingTool[] = [];
  // parity acts as the id of whole data represented by the qr codes
  const parityToExtractedResults = new Map<number, Array<ExtractedResult>>();
  for (const blob of blobs) {
    const fileReader = new FileReader();
    const dataUrl = await new Promise<string>(resolve => {
      fileReader.onload = event => resolve(event.target.result as string);
      fileReader.readAsDataURL(blob);
    });
    const browserQRCodeReader = new BrowserQRCodeReader();
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    browserQRCodeReader.hints = hints;
    let results = [];
    try {
      results = await browserQRCodeReader.decodeFromImageUrl(dataUrl);
      browserQRCodeReader.reset();
    } catch (error) {
      continue;
    }
    const extractedResults = results.map(result => {
      const resultMetadata = result.getResultMetadata();
      const bytes = resultMetadata
        .get(ResultMetadataType.BYTE_SEGMENTS)[0];
      const sequenceNumber = resultMetadata
        .get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE) >> 4;
      const parity = resultMetadata.get(
        ResultMetadataType.STRUCTURED_APPEND_PARITY);
      return {
        bytes,
        sequenceNumber,
        parity,
      };
    });

    for (const extractedResult of extractedResults) {
      // whole acnl regular pattern
      if (extractedResult.bytes.length === 620)
        drawingTools.push(ui8ToDt(new Uint8Array(extractedResult.bytes)));
      // multi-part pattern
      let parityExtractedResults: Array<ExtractedResult>;
      if (extractedResult.bytes.length !== 540) continue;
      if (!parityToExtractedResults.has(extractedResult.parity)) {
        parityExtractedResults = [];
        parityToExtractedResults.set(extractedResult.parity, parityExtractedResults);
      }
      else
        parityExtractedResults =
          parityToExtractedResults.get(extractedResult.parity);
      parityExtractedResults.push(extractedResult);
      const uniqueSequenceNumbers =
        new Set(parityExtractedResults.map((er) => er.sequenceNumber));
      uniqueSequenceNumbers.add(extractedResult.sequenceNumber);
      if (
        !uniqueSequenceNumbers.has(0) ||
        !uniqueSequenceNumbers.has(1) ||
        !uniqueSequenceNumbers.has(2) ||
        !uniqueSequenceNumbers.has(3)
      ) continue;
      // if we have all parts, assemble the pattern
      const acnlExtractedResults: Array<ExtractedResult>
        = new Array<ExtractedResult>();
      for (let i = 0; i < 4; ++i) {
        const index = parityExtractedResults.findIndex((v) => {
          if (v.sequenceNumber === i) return true;
        });
        acnlExtractedResults.push(parityExtractedResults[index]);
      }
      // instantiate acnl from extracted results
      const bytes = acnlExtractedResults.reduce((
        acc: number[],
        curr: ExtractedResult
      ) => {
        return acc.concat(Array.from(curr.bytes));
      }, []);
      drawingTools.push(ui8ToDt(new Uint8Array(bytes)));
      // remove used results to prevent reuse
      for (const acnlExtractedResult of acnlExtractedResults) {
        const index = parityExtractedResults.indexOf(acnlExtractedResult);
        parityExtractedResults.splice(index, 1);
      }
      if (parityExtractedResults.length === 0)
        parityToExtractedResults.delete(extractedResult.parity);
    }
  }
  // only convert fully read drawing tools
  return drawingTools;
};


export const datExts = [".dat"];
export const readDatFiles = async (blobs: Blob[]): Promise<DrawingTool[]> => {
  const drawingTools: DrawingTool[] = [];
  for (const blob of blobs) {
    const fileReader = new FileReader();
    const dat = await new Promise<ArrayBuffer>(resolve => {
      fileReader.onload = event => resolve(event.target.result as ArrayBuffer);
      fileReader.readAsArrayBuffer(blob);
    });
    // ACNH .dat (pre-dlc) decrypted save
    if (dat.byteLength === 11283104) {
      // 50 regular patterns of 680 bytes each are stored in main.dat starting at offset 1930000
      for (let i = 0; i < 50; ++i)
        drawingTools.push(ui8ToDt(new Uint8Array(dat, 1930000 + 680 * i, 680)));
      // 50 pro patterns of 2216 bytes each are stored in main.dat starting at offset 1964000
      for (let i = 0; i < 50; ++i)
        drawingTools.push(ui8ToDt(new Uint8Array(dat, 1964000 + 2216 * i, 2216)));
      // 1 regular pattern (town flag) of 680 bytes in main.dat starting at offset 2074800
      drawingTools.push(ui8ToDt(new Uint8Array(dat, 2074800, 680)));
      // 8 pro patterns (able sisters) of 2216 bytes each are stored in main.dat starting at offset 2075480
      for (let i = 0; i < 8; ++i)
        drawingTools.push(ui8ToDt(new Uint8Array(dat, 2075480 + 2216 * i, 2216)));
    }
    // ACNL (pre-dlc) garden.dat
    else if (dat.byteLength === 522752) {
      for (let i = 0; i < 10; ++i)
        drawingTools.push(ui8ToDt(new Uint8Array(dat, 0xcc + 2160 * i, 2160)));
      for (let i = 0; i < 10; ++i)
        drawingTools.push(ui8ToDt(new Uint8Array(dat, 0x9fdc + 2160 * i, 2160)));
      for (let i = 0; i < 8; ++i)
        drawingTools.push(ui8ToDt(new Uint8Array(dat, 0x80 + 0x05c8b4 + 2160 * i, 2160)));
    }
    // ACNL garden_plus.dat
    else if (dat.byteLength === 563968) {
      for (let i = 0; i < 10; ++i)
        drawingTools.push(ui8ToDt(new Uint8Array(dat, 0xcc + 2160 * i, 2160)));
      for (let i = 0; i < 10; ++i)
        drawingTools.push(ui8ToDt(new Uint8Array(dat, 0x149cc + 2160 * i, 2160)));
      for (let i = 0; i < 8; ++i)
        drawingTools.push(ui8ToDt(new Uint8Array(dat, 0x62338 + 2160 * i, 2160)));
    }
  }
  return drawingTools;
};


export const zipExts = [".zip"];
export const readZipFiles = async (blobs: Blob[]): Promise<DrawingTool[]> => {
  const drawingTools: DrawingTool[] = [];
  for (const blob of blobs) {
    const zip = await JSZip.loadAsync(blob);
    for (const [exts, read] of extsToRead.entries()) {
      const fileNames = Object.keys(zip.files)
        .filter(fileName => exts.some(ext => fileName.endsWith(ext)));
      const files = await Promise.all(fileNames.map(fileName => zip.files[fileName].async("blob")));
      drawingTools.push(...await read(files));
    }
  }
  return drawingTools;
};


export const exts = [
  ...patternExts,
  ...qrImageExts,
  ...datExts,
  ...zipExts,
];


export type read = (blobs: Blob[]) => Promise<DrawingTool[]>;
export const extsToRead = new Map<string[],read>([
  [patternExts, readPatternFiles],
  [qrImageExts, readQrImageFiles],
  [datExts, readDatFiles],
  [zipExts, readZipFiles]
]);


export const extToRead = new Map<string, read>(
  Array.from(extsToRead.entries())
    .map(([exts, read]) => exts.map(ext => [ext, read] as [string, read]))
    .flat(1)
);