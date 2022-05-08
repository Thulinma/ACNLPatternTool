import { isNull, mapValues } from "lodash";
import { v4 as uuidv4 } from "uuid";
import lzString from "lz-string";
import Vue from "vue";
import DrawingTool from "@/libs/DrawingTool";
import ACNLFormat from "./ACNLFormat";
import ACNHFormat from "./ACNHFormat";

/**
 * A UTF16 lzString compressed DrawingTool string.
 */
export type CompressedDrawingTool = string;


/**
 * DrawingTool hash mapped to CompressedPatternItem.
 */
export type CompressedPatternStorage = Record<string, CompressedPatternItem>;


/**
 * A JSON-stringifiable PatternItem for localStorage.
 */
export interface CompressedPatternItem {
  /** DrawingTool data. */
  compressedDrawingTool: CompressedDrawingTool,
  /** UTC ISO-8601 Timestamp */
  created: string,
  /** UUID for the mosaic it's a member of. */
  mosaicId: string,
  /** The row index of the mosaic it belongs to. */
  row: number,
  /** The column index of the mosaic it belongs to. */
  col: number,
  /** The DrawingTool row index of the mosaic it belongs to. */
  maxRow: number,
  /** The DrawingTool column index of the mosaic it belongs to. */
  maxCol: number,
};


/**
 * DrawingTool hash mapped to PatternItem.
 */
export type PatternStorage = Record<string, PatternItem>;


/**
 * A storage format for drawing tools with additional data.
 */
export interface PatternItem {
  /** The DrawingTool. */
  drawingTool: DrawingTool,
  /** UTC ISO-8601 Timestamp */
  createdDate: Date,
  /** UUID for the mosaic it's a member of. */
  mosaicId: string,
  /** The row index of the mosaic it belongs to. */
  row: number,
  /** The column index of the mosaic it belongs to. */
  col: number,
  /** The DrawingTool row index of the mosaic it belongs to. */
  maxRow: number,
  /** The DrawingTool column index of the mosaic it belongs to. */
  maxCol: number,
};


/**
 * Compresses a PatternItem.
 * @param patternItem The PatternItem to compress.
 * @returns A Compressed PatternItem.
 */
export const compressPatternItem = (
  {
    drawingTool,
    createdDate,
    mosaicId,
    row,
    col,
    maxRow,
    maxCol,
  }: PatternItem,
): CompressedPatternItem => ({
  compressedDrawingTool: lzString
    .compressToUTF16(drawingTool.toString()),
  created: createdDate.toUTCString(),
  mosaicId,
  row,
  col,
  maxRow,
  maxCol,
});


/**
 * Decompresses a CompressedPatternItem.
 * @param compressedPatternItem The CompressedPatternItem to decompress.
 * @returns A PatternItem.
 */
export const decompressPatternItem = (
  {
    compressedDrawingTool,
    created,
    mosaicId,
    row,
    col,
    maxRow,
    maxCol,
  }: CompressedPatternItem,
): PatternItem => ({
  drawingTool: new DrawingTool(lzString.decompressFromUTF16(
    compressedDrawingTool,
  ) as string),
  createdDate: new Date(created),
  mosaicId,
  row,
  col,
  maxRow,
  maxCol,
});


/**
 * Adds the PatternItem to a PatternStorage.
 * @param patternStorage The PatternStorage to write the patternItem to.
 * @param patternItem The PatternItem to store.
 */
export const saveToPatternStorage = (
  patternStorage: { [key: string]: PatternItem },
  patternItem: PatternItem,
): void => {
  Vue.set(patternStorage, patternItem.drawingTool.fullHash, patternItem);
};


/**
 * Removes the PatternItem from a Storage.
 * @param patternStorage The PatternStorage to remove the PatternItem from.
 * @param patternItem The PatternItem to remove.
 */
export const deleteFromPatternStorage = (
  patternStorage: { [key: string]: PatternItem },
  patternItem: PatternItem,
): void => {
  Vue.delete(patternStorage, patternItem.drawingTool.fullHash);
};


/**
 * Reads the PatternStorage from localStorage.
 * Also includes patterns from the old storage format.
 * @returns The PatternStorage from localStorage.
 */
export const loadFromLocalStorage = (): PatternStorage => {
  // read from old storage
  const drawingTools = loadFromOldStorage();
  const reformattedOldStorage = drawingTools
    .map((drawingTool) => mockPatternItem(drawingTool))
    .reduce((patternStorage, patternItem) => {
      patternStorage[patternItem.drawingTool.fullHash] = patternItem;
      return patternStorage;
    }, {} as Storage);
  // new storage
  const strPatternStorage = localStorage.getItem("patternStorage");
  if (isNull(strPatternStorage))
    return Object.assign({}, reformattedOldStorage);
  const compressedPatternStorage = JSON.parse(
    strPatternStorage,
  ) as CompressedPatternStorage;
  const patternStorage = mapValues(
    compressedPatternStorage,
    decompressPatternItem,
  );
  // add old storage by mocking
  return Object.assign({}, reformattedOldStorage, patternStorage);
};


/**
 * Writes a PatternStorage back to localStorage.
 * Also removes saved patterns from the old storage format.
 * @param patternStorage The PatternStorage to write to localStorage.
 */
export const saveToLocalStorage = (
  patternStorage: PatternStorage,
): void => {
  const compressedPatternStorage = mapValues(
    patternStorage,
    compressPatternItem,
  );
  localStorage.setItem(
    "patternStorage",
    JSON.stringify(compressedPatternStorage)
  );
  // delete saved from old storage
  if (isUsingOldStorage())
    for (const item of Object.values(patternStorage))
      deleteFromOldStorage(item.drawingTool);
};


// OPERATIONS FOR OLD STORAGE (DIRECTLY ON LOCALSTORAGE)

/**
 * Given a single drawing tool, mocks a non-generated PatternItem.
 * @param drawingTool The drawingTool to convert to a PatternItem. 
 * @returns A mocked PatternItem.
 */
export const mockPatternItem = (
  drawingTool: DrawingTool,
  mockedDate = (() => {
    const mockedDate = new Date();
    mockedDate.setFullYear(2020, 0, 1);
    mockedDate.setMilliseconds(0);
    mockedDate.setSeconds(0);
    mockedDate.setMinutes(0),
    mockedDate.setHours(0);
    return mockedDate;
  })(),
): PatternItem => {
  return {
    drawingTool,
    createdDate: mockedDate,
    mosaicId: uuidv4(),
    row: 0,
    col: 0,
    maxRow: 0,
    maxCol: 0,
  };
};


// Old storage directly stores drawing tool data keyed to a format-based prefix + hash.

interface Class<T> { new(...args: any[]): T; }
const formatToPrefix = new Map<Class<any>, string>([
  [ACNLFormat, "acnl_"],
  [ACNHFormat, "acnh_"],
]);


/**
 * All relevant individual localStorage keys used to store DrawingTools
 * @returns The localStorage keys.
 */
export const oldStorageKeys = (): string[] => Object.keys(localStorage)
  .filter(key => [...formatToPrefix.values()]
    .some(prefix => key.startsWith(prefix))
  );


/**
 * Checks whether or not old storage is being used.
 * @returns Whether or not old storage is being used.
 */
export const isUsingOldStorage = (): boolean => (oldStorageKeys().length > 0);


/**
 * Reads DrawingTools from localStorage in the old storage format.
 * @returns The DrawingTools.
 */
export const loadFromOldStorage = (): DrawingTool[] => {
  const patternKeys = oldStorageKeys();
  return patternKeys
    .map(key => {
      const drawingToolData = lzString.decompressFromUTF16(
        localStorage.getItem(key) as string
      ) as string;
      const drawingTool = new DrawingTool(drawingToolData);
      return drawingTool;
    });
};


/**
 * Writes a pattern to localStorage in the old storage format.
 * @param drawingTool The drawing tool to add to the old storage.
 */
export const saveToOldStorage = (
  drawingTool: DrawingTool
): void => {
  const prefix = formatToPrefix.get(drawingTool.pattern.constructor);
  localStorage.setItem(
    `${prefix}${drawingTool.fullHash}`,
    lzString.compressToUTF16(drawingTool.toString()),
  );
};


/**
 * Deletes a pattern from localStorage in the old storage format.
 * @param drawingTool The drawing tool to delete from the old storage.
 */
export const deleteFromOldStorage = (
  drawingTool: DrawingTool
): void => {
  const prefix = formatToPrefix.get(drawingTool.pattern.constructor);
  localStorage.removeItem(`${prefix}${drawingTool.fullHash}`);
};

