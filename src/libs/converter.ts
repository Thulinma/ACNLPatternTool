import {
  first,
  flow,
  negate,
  isNil,
} from "lodash";
import {
  ImageSmoothingQuality,
  canvasToCanvasGrid,
  saturationFilteredCanvas,
  scaledCanvas,
  canvasToImageData,
} from "@/libs/canvasHelpers";
import DrawingTool from "@/libs/DrawingTool";
import ACNLFormat from "@/libs/ACNLFormat";


/**
 * Analyzes ImageData to select palettes for DrawingTools.
 * @param imgData The image data.
 * @param drawingTools The DrawingTools to change palettes for.
 * @param alphaThreshold If pixel's alpha greater, pixel will be considered for palette selection.
 */
export type PaletteSelector = (
  imgData: ImageData,
  drawingTools: DrawingTool[],
  alphaThreshold: number,
) => void;


export const selectRGBPaletteFromImgData: PaletteSelector = (
  imgData: ImageData,
  drawingTools: DrawingTool[],
  alphaThreshold: number,
): void => {
  if (drawingTools.length <= 0)
    throw new Error('Need at least 1 DrawingTool for palette selection.');
  let palette = [];
  for (let i = 0; i < 256; i++)
    palette.push({ n: i, c: 0 });
  const pixelCount = imgData.data.length;
  for (let i = 0; i < pixelCount; i += 4) {
    if (imgData.data[i + 3] < alphaThreshold)
      continue;
    palette[
      (first(drawingTools) as DrawingTool).findRGB([
        imgData.data[i],
        imgData.data[i + 1],
        imgData.data[i + 2],
      ])
    ].c++;
  }
  palette.sort((a, b) => {
    if (a.c > b.c) {
      return -1;
    }
    if (a.c < b.c) {
      return 1;
    }
    return 0;
  });
  for (let i = 0; i < 15; i++)
    for (const drawingTool of drawingTools)
      drawingTool.setPalette(i, palette[i].n);
};


export const selectYUVPaletteFromImgData: PaletteSelector = (
  imgData: ImageData,
  drawingTools: DrawingTool[],
  alphaThreshold: number,
): void => {
  const availableDrawingTool = first(drawingTools);
  if (isNil(availableDrawingTool))
    throw new Error('Need at least 1 DrawingTool for palette selection.');
  let palette = [];
  for (let i = 0; i < 256; i++)
    palette.push({ n: i, c: 0 });
  const pixelCount = imgData.data.length;
  for (let i = 0; i < pixelCount; i += 4) {
    if (imgData.data[i + 3] < alphaThreshold)
      continue;
    palette[
      availableDrawingTool.findYUV([
        imgData.data[i],
        imgData.data[i + 1],
        imgData.data[i + 2],
      ]) as number
    ].c++;
  }
  palette.sort(function (a, b) {
    if (a.c > b.c) {
      return -1;
    }
    if (a.c < b.c) {
      return 1;
    }
    return 0;
  });
  for (let i = 0; i < 15; i++)
    for (const drawingTool of drawingTools)
      drawingTool.setPalette(i, palette[i].n);
};

type ColorObject = {
  r: number,
  g: number,
  b: number,
};
type ColorArray = [number, number, number];

export const selectMedianCutPaletteFromImgData: PaletteSelector = (
  imgData: ImageData,
  drawingTools: DrawingTool[],
  alphaThreshold: number,
): void => {
  const pixelCount = imgData.data.length;
  let pixels = [];
  for (let i = 0; i < pixelCount; i += 4) {
    if (imgData.data[i + 3] < alphaThreshold)
      continue;
    pixels.push({
      r: imgData.data[i],
      g: imgData.data[i + 1],
      b: imgData.data[i + 2],
    });
  }
  const medianCut = (pixels: ColorObject[]) => {
    let l = Math.floor(pixels.length / 2);
    let r_min = null;
    let r_max = null;
    let g_min = null;
    let g_max = null;
    let b_min = null;
    let b_max = null;
    for (let i in pixels) {
      if (r_min === null || pixels[i].r < r_min)
        r_min = pixels[i].r;
      if (r_max === null || pixels[i].r > r_max)
        r_max = pixels[i].r;
      if (g_min === null || pixels[i].g < g_min)
        g_min = pixels[i].g;
      if (g_max === null || pixels[i].g > g_max)
        g_max = pixels[i].g;
      if (b_min === null || pixels[i].b < b_min)
        b_min = pixels[i].b;
      if (b_max === null || pixels[i].b > b_max)
        b_max = pixels[i].b;
    }
    let r_dist = (r_max as number) - (r_min as number);
    let g_dist = (g_max as number) - (g_min as number);
    let b_dist = (b_max as number) - (b_min as number);
    if (r_dist >= g_dist && r_dist >= b_dist) {
      //Sort on red
      pixels.sort((a, b) => a.r - b.r);
    } else if (g_dist >= r_dist && g_dist >= b_dist) {
      //Sort on green
      pixels.sort((a, b) => a.g - b.g);
    } else {
      //Sort on blue
      pixels.sort((a, b) => a.b - b.b);
    }
    return [pixels.slice(0, l), pixels.slice(l)];
  };
  const medianMultiCut = (buckets: ColorObject[][]) => {
    let res = [];
    for (let i in buckets) {
      const newBuck = medianCut(buckets[i]);
      if (newBuck[0].length)
        res.push(newBuck[0]);
      if (newBuck[1].length)
        res.push(newBuck[1]);
    }
    return res;
  };
  let buckets = medianCut(pixels); //creates 2 buckets
  buckets = medianMultiCut(buckets); //splits into 4
  buckets = medianMultiCut(buckets); //splits into 8
  buckets = medianMultiCut(buckets); //splits into 16

  //Now we have 16 buckets.
  let colors: ColorArray[] = [];
  let uniqCol = new Set();

  //Pushes average color of given bucket onto colors.
  const pushAvg = (b: ColorObject[]) => {
    let r_avg = 0;
    let g_avg = 0;
    let b_avg = 0;
    for (let i in b) {
      r_avg += b[i].r;
      g_avg += b[i].g;
      b_avg += b[i].b;
    }
    let rgb = [
      Math.round(r_avg / b.length),
      Math.round(g_avg / b.length),
      Math.round(b_avg / b.length),
    ] as ColorArray;
    let idx = (first(drawingTools) as DrawingTool).findRGB(rgb);
    if (!uniqCol.has(idx)) {
      colors.push(rgb);
      uniqCol.add(idx);
    }
  };

  //Average the insides for colors.
  for (let i in buckets)
    pushAvg(buckets[i]);
  // console.log("Unique colors: " + uniqCol.size);

  if (uniqCol.size < 15) {
    //We could add more colors. Quantize some more and cross fingers!
    buckets = medianMultiCut(buckets); //splits into 32
    for (let i in buckets) {
      pushAvg(buckets[i]);
    }
    // console.log("Unique colors after further quantize: " + uniqCol.size);
    if (uniqCol.size < 15) {
      buckets = medianMultiCut(buckets); //splits into 64
      for (let i in buckets) {
        pushAvg(buckets[i]);
      }
      // console.log("Unique colors after further quantize: " + uniqCol.size);
      if (uniqCol.size < 15) {
        buckets = medianMultiCut(buckets); //splits into 128
        for (let i in buckets) {
          pushAvg(buckets[i]);
        }
        // console.log(
        //   "Unique colors after further quantize: " + uniqCol.size
        // );
      }
    }
  } else if (uniqCol.size > 15) {
    //We have 16 colors (one for each bucket)
    //Find the closest two colors and merge them
    let minDist = 255 * 255 * 3;
    let bucketA = null;
    let bucketB = null;
    for (let i = 0; i < colors.length; ++i) {
      for (let j = 0; j < colors.length; ++j) {
        if (i >= j)
          continue;
        let rD = colors[i][0] - colors[j][0];
        let gD = colors[i][1] - colors[j][1];
        let bD = colors[i][2] - colors[j][2];
        let match = rD * rD + gD * gD + bD * bD;
        if (match < minDist || bucketA === null) {
          minDist = match;
          bucketA = i;
          bucketB = j;
        }
      }
    }
    //Merge bucket A and B into C
    let bucketC = buckets[bucketA as number].concat(buckets[bucketB as number]);
    colors.splice(bucketB as number); //Must remove B first, since B is guaranteed to be the latter entry
    colors.splice(bucketA as number); //Now we can remove A too, since it was before B and thus couldn't have shifted
    pushAvg(bucketC);
  }

  //Set palette to chosen colors
  let cNum = 0;
  for (let c of uniqCol) {
    if (cNum > 14)
      break;
    for (const drawingTool of drawingTools)
      drawingTool.setPalette(cNum, c);
    cNum++;
  }
};


export const selectGreyscalePaletteFromImgData: PaletteSelector = (
  imgData: ImageData,
  drawingTools: DrawingTool[],
  alphaThreshold: number,
): void => {
  for (const drawingTool of drawingTools)
    for (let i = 0; i < 15; ++i)
      drawingTool.setPalette(i, 0x10 * i + 0xf);
};


export const selectSepiaPalettefromImgData: PaletteSelector = (
  imgData: ImageData,
  drawingTools: DrawingTool[],
  alphaThreshold: number,
): void => {
  for (const drawingTool of drawingTools) {
    for (let i = 0; i < 9; ++i)
      drawingTool.setPalette(i, 0x30 + i);
    for (let i = 9; i < 15; ++i)
      drawingTool.setPalette(i, 0x60 + i - 6);
  }
};


type Score = { n: number, c: number };
export const selectLowestDistancePalette: PaletteSelector = (
  imgData: ImageData,
  drawingTools: DrawingTool[],
  alphaThreshold: number,
) => {
  var palette: Score[] = [];
  var prepixels: Record<string, Record<string, number>>  = {};
  const pixelCount = imgData.data.length;
  for (let i = 0; i < 256; i++) {
    palette.push({ n: i, c: 0 });
  }
  function myPal(pixel: number, r: number, g: number, b: number) {
    var matches: Record<string, number> = {};
    var best = 16581375; //there's no worse best score
    var bestno = 0;
    for (let i = 0; i < 256; i++) {
      if (ACNLFormat.RGBLookup[i] == null)
        continue;
      let rgb = ACNLFormat.RGBLookup[i];
      var match =
        (rgb[0] - r) * (rgb[0] - r) +
        (rgb[1] - g) * (rgb[1] - g) +
        (rgb[2] - b) * (rgb[2] - b);
      if (match < best) {
        best = match;
        bestno = i;
      }
      matches[i.toString()] = match;
    }
    palette[bestno].c++;
    prepixels[pixel] = matches;
  }
  for (let i = 0; i < pixelCount; i += 4) {
    if (imgData.data[i + 3] < alphaThreshold)
      continue;
    myPal(i / 4, imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]);
  }
  palette.sort((a, b) => a.c - b.c);
  while (palette.length > 40)
    palette.pop();
  var best_chosen: number[] = [];
  var scor_chosen = 0x200000; //we can always do better than this
  alert(
    "Optimizing happens after you click ok - please stand by as this might take a while."
  );
  for (var z = 0; z < 4000 && palette.length > 16; z++) {
    var chosen_ones: number[] = [];
    //pick random colors out of the top 40
    while (chosen_ones.length < 15 && chosen_ones.length < palette.length) {
      var next = palette[Math.floor(Math.random() * palette.length)].n;
      if (!chosen_ones.includes(next))
        continue;
      chosen_ones.push(next);
    }
    //score this random selection
    var curr_score = 0;
    for (var p in prepixels) {
      var low_pixel = 750;
      for (var m in prepixels[p]) {
        if (!chosen_ones.includes(parseInt(m)))
          continue;
        if (prepixels[p][m] < low_pixel)
          low_pixel = prepixels[p][m];
      }
      curr_score += low_pixel;
      if (curr_score >= scor_chosen)
        break;
    }
    if (curr_score < scor_chosen) {
      scor_chosen = curr_score;
      best_chosen = chosen_ones;
    }
  }

  for (const drawingTool of drawingTools)
    for (let i = 0; i < 15 && i < best_chosen.length; i++)
      drawingTool.setPalette(i, best_chosen[i]);
}

/**
 * Matches pixel to palette color.
 * Assumes image data dims and drawing tool dims are the same.
 * @param imgData The image data to use.
 * @param drawingTool The drawing tool to set colors for.
 */
export const matchImageDataToPalette = (
  imageData: ImageData,
  drawingTool: DrawingTool,
  alphaThreshold: number,
): void => {
  if (
    imageData.width !== drawingTool.width ||
    imageData.height !== drawingTool.height
  ) throw new Error("ImageData and DrawingTool dims are not equivalent. Cannot set pixel colors.");
  for (let x = 0; x < drawingTool.width; ++x) {
    for (let y = 0; y < drawingTool.height; ++y) {

      const imageDataOffset = (x + (y * drawingTool.width)) * 4;
      const r = imageData.data[imageDataOffset + 0];
      const g = imageData.data[imageDataOffset + 1];
      const b = imageData.data[imageDataOffset + 2];
      const a = imageData.data[imageDataOffset + 3];
      if (a < alphaThreshold)
        drawingTool.setPixel(x, y, 15);
      else
        drawingTool.setPixel(x, y, [r, g, b]);
    }
  }
}

/**
 * Converts a canvas into a grid (mosaic) of DrawingTools.
 * @param canvas The canvas to convert.
 * @param sourceDrawingTool The source DrawingTool to base generated DrwaingTools off of.
 * @param rows The number of rows to compose the mosaic out of.
 * @param cols The number of columsn to compose the mosaic out of.
 * @param alphaThreshold The alpha threshold to meet before pixel is considered for palette selection.
 * @param saturation The degree of saturation.
 * @param imageSmoothingQuality The smoothing option.
 * @param isSplitPalette Whether the palettes are not the same between DrawingTools.
 * @param paletteSelector The method for selecting the palette from the canvas image data.
 * @returns A grid of DrawingTools.
 */
export const convertCanvas = (
  canvas: HTMLCanvasElement,
  sourceDrawingTool: DrawingTool,
  rows: number,
  cols: number,
  alphaThreshold: number,
  saturation: number,
  imageSmoothingQuality: ImageSmoothingQuality
    = ImageSmoothingQuality.sharp,
  isSplitPalette: boolean = false,
  paletteSelector: PaletteSelector,
): DrawingTool[][] => {
  const isMosaic = rows !== 1 || cols !== 1;
  const referenceDrawingTool = new DrawingTool();
  referenceDrawingTool.compatMode = sourceDrawingTool.compatMode;
  let width = isMosaic
    ? referenceDrawingTool.width
    : sourceDrawingTool.width;
  let height = isMosaic
    ? referenceDrawingTool.height
    : sourceDrawingTool.height;
  const mosaicWidth = width * cols;
  const mosaicHeight = height * rows;

  const transformCanvas = flow(
    (canvas) => saturationFilteredCanvas(canvas, saturation),
    (canvas) => scaledCanvas(
      canvas,
      mosaicWidth,
      mosaicHeight,
      imageSmoothingQuality,
    ),
  );
  const transformedCanvas = transformCanvas(canvas);
  const transformedCanvasGrid = canvasToCanvasGrid(transformedCanvas, rows, cols);
  const imageDataGrid: ImageData[][] = transformedCanvasGrid
    .map(canvasGridRow => canvasGridRow
      .map(canvas => canvasToImageData(canvas))
    );

  const drawingToolGrid = transformedCanvasGrid
    .map(canvasGridRow => canvasGridRow
      .map(_ => {
        const drawingTool = new DrawingTool();
        drawingTool.compatMode = referenceDrawingTool.compatMode;
        // if it's a row 1 col 1, use the source tool's pattern type
        if (!isMosaic)
          drawingTool.patternType = sourceDrawingTool.patternType;
        return drawingTool;
      })
    );

  // palette selection
  if (!isSplitPalette)
    paletteSelector(
      canvasToImageData(transformedCanvas),
      drawingToolGrid.flat(1),
      alphaThreshold,
    );
  else
    for (let r = 0; r < rows; ++r)
      for (let c = 0; c < cols; ++c)
        paletteSelector(
          imageDataGrid[r][c],
          [drawingToolGrid[r][c]],
          alphaThreshold,
        );

  // palette matching
  for (let r = 0; r < rows; ++r)
    for (let c = 0; c < cols; ++c)
      matchImageDataToPalette(
        imageDataGrid[r][c],
        drawingToolGrid[r][c],
        alphaThreshold,
      );

  return drawingToolGrid;
};


/**
 * Creates an image preview of the grid of drawing tools.
 * Assumes all DrawingTools have equivalent width and height.
 * @param drawingToolGrid Grid of DrawingTools. All columns must be of the same length.
 * @returns An mosaic image of the DrawingTools.
 */
export const drawingToolGridToImage = (
  drawingToolGrid: (DrawingTool | undefined)[][],
): HTMLCanvasElement => {
  // first drawing tool encountered
  const availableDrawingTool = first(
      (first(
        drawingToolGrid
          .filter(gridRow => gridRow.some(negate(isNil)))
      ) as DrawingTool[])
        .filter(negate(isNil))
    );
  if (isNil(availableDrawingTool))
    throw new Error("No available drawing tools in grid to reference dimensions.");
  const width = availableDrawingTool.width;
  const height = availableDrawingTool.height;
  const rows = drawingToolGrid.length;
  const cols = (first(drawingToolGrid) as DrawingTool[]).length;
  const mosaicWidth = width * cols;
  const mosaicHeight = height * rows;

  const canvasGrid: (HTMLCanvasElement | undefined)[][] = drawingToolGrid
    .map(drawingToolGridRow => drawingToolGridRow
      .map(drawingTool => {
        if (isNil(drawingTool))
          return undefined;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        drawingTool.addCanvas(canvas);
        drawingTool.render();
        return canvas;
      })
    );

  // piece together the grid
  const mosaicCanvas = document.createElement("canvas");
  mosaicCanvas.width = mosaicWidth;
  mosaicCanvas.height = mosaicHeight;
  const mosiacContext = mosaicCanvas.getContext("2d") as CanvasRenderingContext2D;
  mosiacContext.imageSmoothingEnabled = false;

  for (let r = 0; r < rows; ++r)
    for (let c = 0; c < cols; ++c) {
      const subCanvas = canvasGrid[r][c];
      if (!isNil(subCanvas))
        mosiacContext.drawImage(
          subCanvas,
          width * c,
          height * r,
        );
    }

  return mosaicCanvas;
};