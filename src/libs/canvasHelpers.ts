
export enum ImageSmoothingQuality {
  sharp = "",
  low = "low",
  medium = "medium",
  high = "high",
};


export const ensureDecoded = async (image) => {
  if (!image.complete)
    await image.decode();
};

/**
 * Creates an image from a transformedCanvas.
 * @param transformedCanvas The transformedCanvas to imagify.
 * @returns The image representation of the transformedCanvas.
 */
export const canvasToImage = async (
  canvas: HTMLCanvasElement,
): Promise<HTMLImageElement> => {
  const image = document.createElement("img");
  image.src = canvas.toDataURL("image/png");
  await ensureDecoded(image);
  return image;
};


/**
 * Creates a saturated copy of the image.
 * @param transformedCanvas The image to filter.
 * @param saturation The degree of saturation.
 * @returns The filtered copy of the image.
 */
export const saturationFilteredCanvas = (
  canvas: HTMLCanvasElement,
  saturation: number = 100,
): HTMLCanvasElement => {
  // copy image
  const transformedCanvas = document.createElement("canvas");
  transformedCanvas.width = canvas.width;
  transformedCanvas.height = canvas.height;
  const transformedContext = transformedCanvas.getContext("2d");
  transformedContext.imageSmoothingEnabled = false;
  transformedContext.filter = `saturate(${saturation}%)`;
  transformedContext.drawImage(canvas, 0, 0);
  return transformedCanvas;
};


/**
 * Creates a sepia filtered copy of the image.
 * @param transformedCanvas The image to filter.
 * @param sepia The degree of sepia.
 * @returns The filtered copy of the image.
 */
export const sepiaFilteredCanvas = (
  canvas: HTMLCanvasElement,
  sepia: number = 0,
): HTMLCanvasElement => {

  // copy image
  const transformedCanvas = document.createElement("canvas");
  transformedCanvas.width = canvas.width;
  transformedCanvas.height = canvas.height;
  const transformedContext = transformedCanvas.getContext("2d");
  transformedContext.imageSmoothingEnabled = false;
  transformedContext.filter = `sepia(${sepia}%)`
  transformedContext.drawImage(canvas, 0, 0);
  return transformedCanvas;
};


/**
 * Creates a greyscale filtered copy of the image.
 * @param transformedCanvas The image to filter.
 * @param grayscale The degree of grayscale.
 * @returns The filtered copy of the image.
 */
export const grayscaleFilteredCanvas = (
  canvas: HTMLCanvasElement,
  grayscale: number = 0,
): HTMLCanvasElement => {

  // copy image
  const transformedCanvas = document.createElement("canvas");
  transformedCanvas.width = canvas.width;
  transformedCanvas.height = canvas.height;
  const transformedContext = transformedCanvas.getContext("2d");
  transformedContext.imageSmoothingEnabled = false;
  transformedContext.filter = `grayscale(${grayscale}%)`;
  transformedContext.drawImage(canvas, 0, 0);
  return transformedCanvas;
};


/**
 * Creates an non-partial alpha copy of the image.
 * @param transformedCanvas The image to filter.
 * @param alphaThreshold The threshold (0-255) to meet before the pixel becomes opaque.
 * @returns The filtered copy of the image.
 */
export const alphaFilteredCanvas = (
  canvas: HTMLCanvasElement,
  alphaThreshold: number = 255,
): HTMLCanvasElement => {
  // apply clamp
  alphaThreshold = Math.max(Math.min(alphaThreshold, 255), 0);

  // copy image
  const transformedCanvas = document.createElement("canvas");
  transformedCanvas.width = canvas.width;
  transformedCanvas.height = canvas.width;
  const transformedContext = transformedCanvas.getContext("2d");
  transformedContext.imageSmoothingEnabled = false;
  transformedContext.drawImage(canvas, 0, 0);

  // greyscale it
  const imgData = transformedContext.getImageData(
    0, 0,
    canvas.width,
    canvas.height,
  );
  for (let i = 0; i < imgData.data.length; i += 4) {
    const [a] = imgData.data.slice(i + 3, i + 4);
    // no partial transparency
    imgData[i + 3] = a >= alphaThreshold ? 255 : 0;
  }
  transformedContext.putImageData(imgData, 0, 0);
  return transformedCanvas;
};


/**
 * Creates an downscaled copy of the image.
 * @param canvas The image to downscale.
 * @param width The target width.
 * @param height The target height.
 * @returns The downscaled copy of the image.
 */
export const scaledCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  imageSmoothingQuality: ImageSmoothingQuality,
): HTMLCanvasElement => {

  // copy image
  const transformedCanvas = document.createElement("canvas");
  transformedCanvas.width = width;
  transformedCanvas.height = height;
  const transformedContext = transformedCanvas.getContext("2d");
  if (imageSmoothingQuality == ImageSmoothingQuality.sharp)
    transformedContext.imageSmoothingEnabled = false;
  else
    transformedContext.imageSmoothingQuality = imageSmoothingQuality;
  transformedContext.drawImage(
    canvas,
    0, 0,
    canvas.width,
    canvas.height,
    0, 0,
    width,
    height,
  );
  return transformedCanvas;
};


/**
 * Creates a subsection copy of the image.
 * @param canvas The image to extract from.
 * @param offsetX The X offset of the subsection.
 * @param offsetY The Y offset of the subsection.
 * @param width The width of the subsection.
 * @param height The height of the subsection.
 * @returns The subsection of the source image.
 */
export const subCanvas = (
  canvas: HTMLCanvasElement,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
): HTMLCanvasElement => {

  // copy subimage
  const transformedCanvas = document.createElement("canvas");
  transformedCanvas.width = width;
  transformedCanvas.height = height;
  const transformedContext = transformedCanvas.getContext("2d");
  transformedContext.imageSmoothingEnabled = false;
  transformedContext.drawImage(
    canvas,
    offsetX,
    offsetY,
    width,
    height,
    0, 0,
    width,
    height,
  );
  return transformedCanvas;
};


/**
 * Split up into rows and columns
 * @param image The image to split.
 * @param rows The number of rows.
 * @param cols The number of columns.
 * @returns A grid of images.
 */
export const canvasToCanvasGrid = (
  canvas: HTMLCanvasElement,
  rows: number,
  cols: number,
): HTMLCanvasElement[][] => {

  // split image
  const canvasGrid: HTMLCanvasElement[][] = [];
  const colWidth = Math.floor(canvas.width / cols);
  const rowHeight = Math.floor(canvas.height / rows);
  for (let r = 0; r < rows; ++r) {
    const canvasGridRow: HTMLCanvasElement[] = [];
    for (let c = 0; c < cols; ++c)
      canvasGridRow.push(subCanvas(
        canvas,
        colWidth * c,
        rowHeight * r,
        colWidth,
        rowHeight,
      ));
    canvasGrid.push(canvasGridRow);
  }
  return canvasGrid;
};


/**
 * Converts an image to its ImageData.
 * @param image The image to get the data from.
 * @returns The ImageData.
 */
export const canvasToImageData = (
  canvas: HTMLCanvasElement,
): ImageData => {
  const context = canvas.getContext("2d");
  return context.getImageData(
    0, 0,
    canvas.width,
    canvas.height,
  );
};

/**
 * Determines whether image has transparency.
 */
export const canvasIsTransparent = (
  canvas: HTMLCanvasElement,
): boolean => {
  const imageData = canvasToImageData(canvas);
  for (let r = 0; r < imageData.height; ++r) {
    for (let c = 0; c < imageData.width; ++c) {
      const offset = ((r * imageData.width) + c) * 4;
      const a = imageData.data[offset + 3];
      if (a < 255)
        return true;
    }
  }
  return false;
};