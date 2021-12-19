import {
  BinaryBitmap,
  HybridBinarizer,
  DecodeHintType,
  Result,
  HTMLCanvasElementLuminanceSource,
  HTMLVisualMediaElement,
  VideoInputDevice,
  ArgumentException,
  ChecksumException,
  FormatException,
  NotFoundException,
} from '@zxing/library/esm';
import AcQRCodeReader from "./AcQRCodeReader";
import AcDecodeContinuouslyCallback from "./AcDecodeContinuouslyCallback";
import ImageLoadingException from "./ImageLoadingException";

/**
 * Patched BrowserQRCodeReader for multi-QR reading.
 * Replaces all single results in base class with multi-results.
 */
class AcBrowserQRCodeReader {
  /**
   * Creates an instance of AcBrowserQRCodeReader.
   * @param {AcQRCodeReader} [reader=new AcQRCodeReader()] The reader instance to decode the barcode
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent successful decode tries
   */
  public constructor(
    protected readonly reader: AcQRCodeReader = new AcQRCodeReader(),
    protected timeBetweenScansMillis: number = 500, protected _hints?: Map<DecodeHintType, any>
  ) { }


  /**
   * If navigator is present.
   */
  public get hasNavigator() {
    return typeof navigator !== 'undefined';
  }

  /**
   * If mediaDevices under navigator is supported.
   */
  public get isMediaDevicesSuported() {
    return this.hasNavigator && !!navigator.mediaDevices;
  }

  /**
   * If enumerateDevices under navigator is supported.
   */
  public get canEnumerateDevices() {
    return !!(this.isMediaDevicesSuported && navigator.mediaDevices.enumerateDevices);
  }

  /**
   * This will break the loop.
   */
  private _stopContinuousDecode = false;

  /**
   * This will break the loop.
   */
  private _stopAsyncDecode = false;

  /**
   * Delay time between decode attempts made by the scanner.
   */
  protected _timeBetweenDecodingAttempts: number = 0;

  /** Time between two decoding tries in milli seconds. */
  get timeBetweenDecodingAttempts(): number {
    return this._timeBetweenDecodingAttempts;
  }

  /**
   * Change the time span the decoder waits between two decoding tries.
   *
   * @param {number} millis Time between two decoding tries in milli seconds.
   */
  set timeBetweenDecodingAttempts(millis: number) {
    this._timeBetweenDecodingAttempts = millis < 0 ? 0 : millis;
  }

  /**
   * The HTML canvas element, used to draw the video or image's frame for decoding.
   */
  protected captureCanvas: HTMLCanvasElement;
  /**
   * The HTML canvas element context.
   */
  protected captureCanvasContext: CanvasRenderingContext2D;

  /**
   * The HTML image element, used as a fallback for the video element when decoding.
   */
  protected imageElement: HTMLImageElement;

  /**
   * Should contain the current registered listener for image loading,
   * used to unregister that listener when needed.
   */
  protected imageLoadedListener: EventListener;
  protected imageErrorListener: EventListener;

  /**
   * The stream output from camera.
   */
  protected stream: MediaStream;

  /**
   * The HTML video element, used to display the camera stream.
   */
  protected videoElement: HTMLVideoElement;

  /**
   * Should contain the current registered listener for video loaded-metadata,
   * used to unregister that listener when needed.
   */
  protected videoCanPlayListener: EventListener;

  /**
   * Should contain the current registered listener for video play-ended,
   * used to unregister that listener when needed.
   */
  protected videoEndedListener: EventListener;

  /**
   * Should contain the current registered listener for video playing,
   * used to unregister that listener when needed.
   */
  protected videoPlayingEventListener: EventListener;

  /**
   * Sets the hints.
   */
  set hints(hints: Map<DecodeHintType, any>) {
    this._hints = hints || null;
  }

  /**
   * Sets the hints.
   */
  get hints(): Map<DecodeHintType, any> {
    return this._hints;
  }

  /**
   * Lists all the available video input devices.
   */
  public async listVideoInputDevices(): Promise<MediaDeviceInfo[]> {

    if (!this.hasNavigator) {
      throw new Error('Can\'t enumerate devices, navigator is not present.');
    }

    if (!this.canEnumerateDevices) {
      throw new Error('Can\'t enumerate devices, method not supported.');
    }

    const devices = await navigator.mediaDevices.enumerateDevices();

    const videoDevices: MediaDeviceInfo[] = [];

    for (const device of devices) {

      const kind = <string>device.kind === 'video' ? 'videoinput' : device.kind;

      if (kind !== 'videoinput') {
        continue;
      }

      const deviceId = device.deviceId || (<any>device).id;
      const label = device.label || `Video device ${videoDevices.length + 1}`;
      const groupId = device.groupId;

      const videoDevice = <MediaDeviceInfo>{ deviceId, label, kind, groupId };

      videoDevices.push(videoDevice);
    }

    return videoDevices;
  }


  /**
   * Obtain the list of available devices with type 'videoinput'.
   *
   * @returns {Promise<VideoInputDevice[]>} an array of available video input devices
   *
   * @memberOf BrowserCodeReader
   *
   * @deprecated Use `listVideoInputDevices` instead.
   */
  public async getVideoInputDevices(): Promise<VideoInputDevice[]> {

    const devices = await this.listVideoInputDevices();

    return devices.map(d => new VideoInputDevice(d.deviceId, d.label));
  }

  /**
   * Let's you find a device using it's Id.
   */
  public async findDeviceById(deviceId: string): Promise<MediaDeviceInfo> {

    const devices = await this.listVideoInputDevices();

    if (!devices) {
      return null;
    }

    return devices.find(x => x.deviceId === deviceId);
  }

  /**
   * Decodes the barcode from the device specified by deviceId while showing the video in the specified video element.
   *
   * @param deviceId the id of one of the devices obtained after calling getVideoInputDevices. Can be undefined, in this case it will decode from one of the available devices, preffering the main camera (environment facing) if available.
   * @param video the video element in page where to show the video while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined, in which case no video will be shown.
   * @returns The decoding result.
   *
   * @memberOf BrowserCodeReader
   *
   * @deprecated Use `decodeOnceFromVideoDevice` instead.
   */
  public async decodeFromInputVideoDevice(deviceId?: string, videoSource?: string | HTMLVideoElement): Promise<Array<Result>> {
    return await this.decodeOnceFromVideoDevice(deviceId, videoSource);
  }

  /**
   * In one attempt, tries to decode the barcode from the device specified by deviceId while showing the video in the specified video element.
   *
   * @param deviceId the id of one of the devices obtained after calling getVideoInputDevices. Can be undefined, in this case it will decode from one of the available devices, preffering the main camera (environment facing) if available.
   * @param video the video element in page where to show the video while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined, in which case no video will be shown.
   * @returns The decoding result.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeOnceFromVideoDevice(deviceId?: string, videoSource?: string | HTMLVideoElement): Promise<Array<Result>> {

    this.reset();

    let videoConstraints: MediaTrackConstraints;

    if (!deviceId) {
      videoConstraints = { facingMode: 'environment' };
    } else {
      videoConstraints = { deviceId: { exact: deviceId } };
    }

    const constraints: MediaStreamConstraints = { video: videoConstraints };

    return await this.decodeOnceFromConstraints(constraints, videoSource);
  }

  /**
   * In one attempt, tries to decode the barcode from a stream obtained from the given constraints while showing the video in the specified video element.
   *
   * @param constraints the media stream constraints to get s valid media stream to decode from
   * @param video the video element in page where to show the video while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined, in which case no video will be shown.
   * @returns The decoding result.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeOnceFromConstraints(constraints: MediaStreamConstraints, videoSource?: string | HTMLVideoElement): Promise<Array<Result>> {

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    return await this.decodeOnceFromStream(stream, videoSource);
  }

  /**
   * In one attempt, tries to decode the barcode from a stream obtained from the given constraints while showing the video in the specified video element.
   *
   * @param {MediaStream} [constraints] the media stream constraints to get s valid media stream to decode from
   * @param {string|HTMLVideoElement} [video] the video element in page where to show the video while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined, in which case no video will be shown.
   * @returns {Promise<Result>} The decoding result.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeOnceFromStream(stream: MediaStream, videoSource?: string | HTMLVideoElement): Promise<Array<Result>> {

    this.reset();

    const video = await this.attachStreamToVideo(stream, videoSource);
    const results = await this.decodeOnce(video);

    return results;
  }

  /**
   * Continuously decodes the barcode from the device specified by device while showing the video in the specified video element.
   *
   * @param {string|null} [deviceId] the id of one of the devices obtained after calling getVideoInputDevices. Can be undefined, in this case it will decode from one of the available devices, preffering the main camera (environment facing) if available.
   * @param {string|HTMLVideoElement|null} [video] the video element in page where to show the video while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined, in which case no video will be shown.
   * @returns {Promise<void>}
   *
   * @memberOf BrowserCodeReader
   *
   * @deprecated Use `decodeFromVideoDevice` instead.
   */
  public async decodeFromInputVideoDeviceContinuously(deviceId: string | null, videoSource: string | HTMLVideoElement | null, callbackFn: AcDecodeContinuouslyCallback): Promise<void> {
    return await this.decodeFromVideoDevice(deviceId, videoSource, callbackFn);
  }

  /**
   * Continuously tries to decode the barcode from the device specified by device while showing the video in the specified video element.
   *
   * @param {string|null} [deviceId] the id of one of the devices obtained after calling getVideoInputDevices. Can be undefined, in this case it will decode from one of the available devices, preffering the main camera (environment facing) if available.
   * @param {string|HTMLVideoElement|null} [video] the video element in page where to show the video while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined, in which case no video will be shown.
   * @returns {Promise<void>}
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeFromVideoDevice(deviceId: string | null, videoSource: string | HTMLVideoElement | null, callbackFn: AcDecodeContinuouslyCallback): Promise<void> {

    let videoConstraints: MediaTrackConstraints;

    if (!deviceId) {
      videoConstraints = { facingMode: 'environment' };
    } else {
      videoConstraints = { deviceId: { exact: deviceId } };
    }

    const constraints: MediaStreamConstraints = { video: videoConstraints };

    return await this.decodeFromConstraints(constraints, videoSource, callbackFn);
  }

  /**
   * Continuously tries to decode the barcode from a stream obtained from the given constraints while showing the video in the specified video element.
   *
   * @param {MediaStream} [constraints] the media stream constraints to get s valid media stream to decode from
   * @param {string|HTMLVideoElement} [video] the video element in page where to show the video while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined, in which case no video will be shown.
   * @returns {Promise<Array<Result>>} The decoding result.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeFromConstraints(constraints: MediaStreamConstraints, videoSource: string | HTMLVideoElement, callbackFn: AcDecodeContinuouslyCallback): Promise<void> {

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    return await this.decodeFromStream(stream, videoSource, callbackFn);
  }

  /**
   * In one attempt, tries to decode the barcode from a stream obtained from the given constraints while showing the video in the specified video element.
   *
   * @param {MediaStream} [constraints] the media stream constraints to get s valid media stream to decode from
   * @param {string|HTMLVideoElement} [video] the video element in page where to show the video while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined, in which case no video will be shown.
   * @returns {Promise<Array<Result>>} The decoding result.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeFromStream(stream: MediaStream, videoSource: string | HTMLVideoElement, callbackFn: AcDecodeContinuouslyCallback) {

    this.reset();

    const video = await this.attachStreamToVideo(stream, videoSource);

    return await this.decodeContinuously(video, callbackFn);
  }

  /**
   * Breaks the decoding loop.
   */
  public stopAsyncDecode() {
    this._stopAsyncDecode = true;
  }

  /**
   * Breaks the decoding loop.
   */
  public stopContinuousDecode() {
    this._stopContinuousDecode = true;
  }

  /**
   * Sets the new stream and request a new decoding-with-delay.
   *
   * @param stream The stream to be shown in the video element.
   * @param decodeFn A callback for the decode method.
   */
  protected async attachStreamToVideo(stream: MediaStream, videoSource: string | HTMLVideoElement): Promise<HTMLVideoElement> {

    const videoElement = this.prepareVideoElement(videoSource);

    this.addVideoSource(videoElement, stream);

    this.videoElement = videoElement;
    this.stream = stream;

    await this.playVideoOnLoadAsync(videoElement);

    return videoElement;
  }

  /**
   *
   * @param videoElement
   */
  protected playVideoOnLoadAsync(videoElement: HTMLVideoElement): Promise<void> {
    return new Promise((resolve, reject) => this.playVideoOnLoad(videoElement, () => resolve()));
  }

  /**
   * Binds listeners and callbacks to the videoElement.
   *
   * @param element
   * @param callbackFn
   */
  protected playVideoOnLoad(element: HTMLVideoElement, callbackFn: EventListener): void {

    this.videoEndedListener = () => this.stopStreams();
    this.videoCanPlayListener = () => this.tryPlayVideo(element);

    element.addEventListener('ended', this.videoEndedListener);
    element.addEventListener('canplay', this.videoCanPlayListener);
    element.addEventListener('playing', callbackFn);

    // if canplay was already fired, we won't know when to play, so just give it a try
    this.tryPlayVideo(element);
  }

  /**
   * Checks if the given video element is currently playing.
   */
  isVideoPlaying(video: HTMLVideoElement): boolean {
    return video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
  }

  /**
   * Just tries to play the video and logs any errors.
   * The play call is only made is the video is not already playing.
   */
  async tryPlayVideo(videoElement: HTMLVideoElement): Promise<void> {

    if (this.isVideoPlaying(videoElement)) {
      console.warn('Trying to play video that is already playing.');
      return;
    }

    try {
      await videoElement.play();
    } catch {
      console.warn('It was not possible to play the video.');
    }
  }

  /**
   * Searches and validates a media element.
   */
  public getMediaElement(mediaElementId: string, type: string): HTMLVisualMediaElement {

    const mediaElement = document.getElementById(mediaElementId);

    if (!mediaElement) {
      throw new ArgumentException(`element with id '${mediaElementId}' not found`);
    }

    if (mediaElement.nodeName.toLowerCase() !== type.toLowerCase()) {
      throw new ArgumentException(`element with id '${mediaElementId}' must be an ${type} element`);
    }

    return <HTMLVisualMediaElement>mediaElement;
  }

  /**
   * Decodes the barcode from an image.
   *
   * @param {(string|HTMLImageElement)} [source] The image element that can be either an element id or the element itself. Can be undefined in which case the decoding will be done from the imageUrl parameter.
   * @param {string} [url]
   * @returns {Promise<Array<Result>>} The decoding results.
   *
   * @memberOf BrowserCodeReader
   */
  public decodeFromImage(source?: string | HTMLImageElement, url?: string): Promise<Array<Result>> {

    if (!source && !url) {
      throw new ArgumentException('either imageElement with a src set or an url must be provided');
    }

    if (url && !source) {
      return this.decodeFromImageUrl(url);
    }

    return this.decodeFromImageElement(<HTMLImageElement>source);
  }

  /**
   * Decodes the barcode from a video.
   *
   * @param {(string|HTMLImageElement)} [source] The image element that can be either an element id or the element itself. Can be undefined in which case the decoding will be done from the imageUrl parameter.
   * @param {string} [url]
   * @returns {Promise<Result>} The decoding results.
   *
   * @memberOf BrowserCodeReader
   */
  public decodeFromVideo(source?: string | HTMLVideoElement, url?: string): Promise<Array<Result>> {

    if (!source && !url) {
      throw new ArgumentException('Either an element with a src set or an URL must be provided');
    }

    if (url && !source) {
      return this.decodeFromVideoUrl(url);
    }

    return this.decodeFromVideoElement(source);
  }

  /**
   * Decodes continuously the barcode from a video.
   *
   * @param {(string|HTMLImageElement)} [source] The image element that can be either an element id or the element itself. Can be undefined in which case the decoding will be done from the imageUrl parameter.
   * @param {string} [url]
   * @returns {Promise<Result>} The decoding result.
   *
   * @memberOf BrowserCodeReader
   *
   * @experimental
   */
  public decodeFromVideoContinuously(source: string | HTMLVideoElement | null, url: string | null, callbackFn: AcDecodeContinuouslyCallback): Promise<void> {

    if (undefined === source && undefined === url) {
      throw new ArgumentException('Either an element with a src set or an URL must be provided');
    }

    if (url && !source) {
      return this.decodeFromVideoUrlContinuously(url, callbackFn);
    }

    return this.decodeFromVideoElementContinuously(source, callbackFn);
  }

  /**
   * Decodes something from an image HTML element.
   */
  public decodeFromImageElement(image: HTMLImageElement): Promise<Array<Result>> {

    if (!image) {
      throw new ArgumentException('An image element must be provided.');
    }

    this.reset();

    const imageCopy = document.createElement("img");
    this.imageElement = imageCopy;
    
    const decodeTask = this._decodeOnLoadImage(imageCopy);
    
    imageCopy.src = image.src;
    
    return decodeTask;
  }

  /**
   * Decodes something from an image HTML element.
   */
  public decodeFromVideoElement(source: string | HTMLVideoElement): Promise<Array<Result>> {

    const element = this._decodeFromVideoElementSetup(source);

    return this._decodeOnLoadVideo(element);
  }

  /**
   * Decodes something from an image HTML element.
   */
  public decodeFromVideoElementContinuously(source: string | HTMLVideoElement, callbackFn: AcDecodeContinuouslyCallback): Promise<void> {

    const element = this._decodeFromVideoElementSetup(source);

    return this._decodeOnLoadVideoContinuously(element, callbackFn);
  }

  /**
   * Sets up the video source so it can be decoded when loaded.
   *
   * @param source The video source element.
   */
  private _decodeFromVideoElementSetup(source: string | HTMLVideoElement) {

    if (!source) {
      throw new ArgumentException('A video element must be provided.');
    }

    this.reset();

    const element = this.prepareVideoElement(source);

    // defines the video element before starts decoding
    this.videoElement = element;

    return element;
  }

  /**
   * Decodes an image from a URL.
   */
  public decodeFromImageUrl(url?: string): Promise<Array<Result>> {

    if (!url) {
      throw new ArgumentException('An URL must be provided.');
    }

    this.reset();

    const element = this.prepareImageElement();

    this.imageElement = element;

    const decodeTask = this._decodeOnLoadImage(element);

    element.src = url;

    return decodeTask;
  }

  /**
   * Decodes an image from a URL.
   */
  public decodeFromVideoUrl(url: string): Promise<Array<Result>> {

    if (!url) {
      throw new ArgumentException('An URL must be provided.');
    }

    this.reset();

    // creates a new element
    const element = this.prepareVideoElement();

    const decodeTask = this.decodeFromVideoElement(element);

    element.src = url;

    return decodeTask;
  }

  /**
   * Decodes an image from a URL.
   *
   * @experimental
   */
  public decodeFromVideoUrlContinuously(url: string, callbackFn: AcDecodeContinuouslyCallback): Promise<void> {

    if (!url) {
      throw new ArgumentException('An URL must be provided.');
    }

    this.reset();

    // creates a new element
    const element = this.prepareVideoElement();

    const decodeTask = this.decodeFromVideoElementContinuously(element, callbackFn);

    element.src = url;

    return decodeTask;
  }

  private _decodeOnLoadImage(element: HTMLImageElement): Promise<Array<Result>> {
    return new Promise((resolve, reject) => {
      this.imageLoadedListener = async () => {
        this.decodeOnce(element, false, false).then(resolve, reject);
      };
      element.addEventListener('load', this.imageLoadedListener);
      this.imageErrorListener = () => {
        element.removeEventListener('error', this.imageErrorListener);
        this.imageErrorListener = undefined;
        // still not firing idk why
        const message = `The image at ${element.currentSrc} could not be loaded.`;
        reject(new ImageLoadingException(message));
      };
      element.addEventListener('error', this.imageErrorListener);
    });
  }

  private async _decodeOnLoadVideo(videoElement: HTMLVideoElement): Promise<Array<Result>> {
    // plays the video
    await this.playVideoOnLoadAsync(videoElement);
    // starts decoding after played the video
    return await this.decodeOnce(videoElement);
  }

  private async _decodeOnLoadVideoContinuously(videoElement: HTMLVideoElement, callbackFn: AcDecodeContinuouslyCallback): Promise<void> {
    // plays the video
    await this.playVideoOnLoadAsync(videoElement);
    // starts decoding after played the video
    this.decodeContinuously(videoElement, callbackFn);
  }

  public isImageLoaded(img: HTMLImageElement) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) {
      return false;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.

    if (img.naturalWidth === 0) {
      return false;
    }

    // No other way of checking: assume it’s ok.
    return true;
  }

  public prepareImageElement(imageSource?: HTMLImageElement | string): HTMLImageElement {

    let imageElement: HTMLImageElement;

    if (typeof imageSource === 'undefined') {
      imageElement = document.createElement('img');
      imageElement.width = 200;
      imageElement.height = 200;
    }

    if (typeof imageSource === 'string') {
      imageElement = <HTMLImageElement>this.getMediaElement(imageSource, 'img');
    }

    if (imageSource instanceof HTMLImageElement) {
      imageElement = document.createElement('img');
    }

    return imageElement;
  }

  /**
   * Sets a HTMLVideoElement for scanning or creates a new one.
   *
   * @param videoSource The HTMLVideoElement to be set.
   */
  public prepareVideoElement(videoSource?: HTMLVideoElement | string): HTMLVideoElement {

    let videoElement: HTMLVideoElement;

    if (!videoSource && typeof document !== 'undefined') {
      videoElement = document.createElement('video');
      videoElement.width = 200;
      videoElement.height = 200;
    }

    if (typeof videoSource === 'string') {
      videoElement = <HTMLVideoElement>this.getMediaElement(videoSource, 'video');
    }

    if (videoSource instanceof HTMLVideoElement) {
      videoElement = videoSource;
    }

    // Needed for iOS 11
    videoElement.setAttribute('autoplay', 'true');
    videoElement.setAttribute('muted', 'true');
    videoElement.setAttribute('playsinline', 'true');

    return videoElement;
  }

  /**
   * Tries to decode from the video input until it finds some value.
   */
  public decodeOnce(element: HTMLVisualMediaElement, retryIfNotFound = true, retryIfChecksumOrFormatError = true): Promise<Array<Result>> {

    this._stopAsyncDecode = false;

    const loop = (resolve: (value?: Array<Result> | PromiseLike<Array<Result>>) => void, reject: (reason?: any) => void) => {

      if (this._stopAsyncDecode) {
        reject(new NotFoundException('Video stream has ended before any code could be detected.'));
        this._stopAsyncDecode = undefined;
        return;
      }

      try {
        const results = this.decode(element);
        resolve(results);
      } catch (e) {

        const ifNotFound = retryIfNotFound && e instanceof NotFoundException;
        const isChecksumOrFormatError = e instanceof ChecksumException || e instanceof FormatException;
        const ifChecksumOrFormat = isChecksumOrFormatError && retryIfChecksumOrFormatError;

        if (ifNotFound || ifChecksumOrFormat) {
          // trying again
          return setTimeout(loop, this._timeBetweenDecodingAttempts, resolve, reject);
        }

        reject(e);
      }
    };

    return new Promise((resolve, reject) => loop(resolve, reject));
  }

  /**
   * Continuously decodes from video input.
   */
  public decodeContinuously(element: HTMLVideoElement, callbackFn: AcDecodeContinuouslyCallback): void {

    this._stopContinuousDecode = false;

    const loop = () => {

      if (this._stopContinuousDecode) {
        this._stopContinuousDecode = undefined;
        return;
      }

      try {
        const results = this.decode(element);
        callbackFn(results, null);
        setTimeout(loop, this.timeBetweenScansMillis);
      } catch (e) {

        callbackFn(null, e);

        const isChecksumOrFormatError = e instanceof ChecksumException || e instanceof FormatException;
        const isNotFound = e instanceof NotFoundException;

        if (isChecksumOrFormatError || isNotFound) {
          // trying again
          setTimeout(loop, this._timeBetweenDecodingAttempts);
        }

      }
    };

    loop();
  }

  /**
   * Gets the BinaryBitmap for ya! (and decodes it)
   */
  public decode(element: HTMLVisualMediaElement): Array<Result> {

    // get binary bitmap for decode function
    const binaryBitmap = this.createBinaryBitmap(element);

    return this.decodeBitmap(binaryBitmap);
  }

  /**
   * Creates a binaryBitmap based in some image source.
   *
   * @param mediaElement HTML element containing drawable image source.
   */
  public createBinaryBitmap(mediaElement: HTMLVisualMediaElement): BinaryBitmap {

    const ctx = this.getCaptureCanvasContext(mediaElement);

    this.drawImageOnCanvas(ctx, mediaElement);

    const canvas = this.getCaptureCanvas(mediaElement);

    const luminanceSource = new HTMLCanvasElementLuminanceSource(canvas);
    const hybridBinarizer = new HybridBinarizer(luminanceSource);

    return new BinaryBitmap(hybridBinarizer);
  }

  /**
   *
   */
  protected getCaptureCanvasContext(mediaElement?: HTMLVisualMediaElement) {

    if (!this.captureCanvasContext) {
      const elem = this.getCaptureCanvas(mediaElement);
      const ctx = elem.getContext('2d');
      this.captureCanvasContext = ctx;
    }

    return this.captureCanvasContext;
  }

  /**
   *
   */
  protected getCaptureCanvas(mediaElement?: HTMLVisualMediaElement): HTMLCanvasElement {

    if (!this.captureCanvas) {
      const elem = this.createCaptureCanvas(mediaElement);
      this.captureCanvas = elem;
    }

    return this.captureCanvas;
  }

  /**
   * Ovewriting this allows you to manipulate the snapshot image in anyway you want before decode.
   */
  public drawImageOnCanvas(canvasElementContext: CanvasRenderingContext2D, srcElement: HTMLVisualMediaElement) {
    canvasElementContext.drawImage(srcElement, 0, 0);
  }

  /**
   * Call the encapsulated readers decode
   */
  public decodeBitmap(binaryBitmap: BinaryBitmap): Array<Result> {
    return this.reader.decodeMultiple(binaryBitmap, this._hints);
  }

  /**
   * 🖌 Prepares the canvas for capture and scan frames.
   */
  public createCaptureCanvas(mediaElement?: HTMLVisualMediaElement): HTMLCanvasElement {

    if (typeof document === 'undefined') {
      this._destroyCaptureCanvas();
      return null;
    }

    const canvasElement = document.createElement('canvas');

    let width: number;
    let height: number;

    if (typeof mediaElement !== 'undefined') {
      if (mediaElement instanceof HTMLVideoElement) {
        width = mediaElement.videoWidth;
        height = mediaElement.videoHeight;
      } else if (mediaElement instanceof HTMLImageElement) {
        width = mediaElement.naturalWidth || mediaElement.width;
        height = mediaElement.naturalHeight || mediaElement.height;
      }
    }

    canvasElement.style.width = width + 'px';
    canvasElement.style.height = height + 'px';
    canvasElement.width = width;
    canvasElement.height = height;

    return canvasElement;
  }

  /**
   * Stops the continuous scan and cleans the stream.
   */
  protected stopStreams(): void {
    if (this.stream) {
      this.stream.getVideoTracks().forEach(t => t.stop());
      this.stream = undefined;
    }
    if (this._stopAsyncDecode === false) {
      this.stopAsyncDecode();
    }
    if (this._stopContinuousDecode === false) {
      this.stopContinuousDecode();
    }
  }

  /**
   * Resets the code reader to the initial state. Cancels any ongoing barcode scanning from video or camera.
   *
   * @memberOf BrowserCodeReader
   */
  public reset() {

    // stops the camera, preview and scan 🔴

    this.stopStreams();

    // clean and forget about HTML elements

    this._destroyVideoElement();
    this._destroyImageElement();
    this._destroyCaptureCanvas();
  }

  private _destroyVideoElement(): void {

    if (!this.videoElement) {
      return;
    }

    // first gives freedon to the element 🕊

    if (typeof this.videoEndedListener !== 'undefined') {
      this.videoElement.removeEventListener('ended', this.videoEndedListener);
    }

    if (typeof this.videoPlayingEventListener !== 'undefined') {
      this.videoElement.removeEventListener('playing', this.videoPlayingEventListener);
    }

    if (typeof this.videoCanPlayListener !== 'undefined') {
      this.videoElement.removeEventListener('loadedmetadata', this.videoCanPlayListener);
    }

    // then forgets about that element 😢

    this.cleanVideoSource(this.videoElement);

    this.videoElement = undefined;
  }

  private _destroyImageElement(): void {

    if (!this.imageElement) {
      return;
    }

    // first gives freedon to the element 🕊

    if (undefined !== this.imageLoadedListener) {
      this.imageElement.removeEventListener('load', this.imageLoadedListener);
      this.imageLoadedListener = undefined;
    }
    if (undefined !== this.imageErrorListener) {
      this.imageElement.removeEventListener('error', this.imageErrorListener);
      this.imageErrorListener = undefined;
    }

    // then forget about that element 😢

    this.imageElement.src = undefined;
    this.imageElement.removeAttribute('src');
    this.imageElement = undefined;
  }

  /**
   * Cleans canvas references 🖌
   */
  private _destroyCaptureCanvas(): void {

    // then forget about that element 😢

    this.captureCanvasContext = undefined;
    this.captureCanvas = undefined;
  }

  /**
   * Defines what the videoElement src will be.
   *
   * @param videoElement
   * @param stream
   */
  public addVideoSource(videoElement: HTMLVideoElement, stream: MediaStream): void {
    // Older browsers may not have `srcObject`
    try {
      // @note Throws Exception if interrupted by a new loaded request
      videoElement.srcObject = stream;
    } catch (err) {
      // @note Avoid using this in new browsers, as it is going away.
      videoElement.src = URL.createObjectURL(stream);
    }
  }

  /**
   * Unbinds a HTML video src property.
   *
   * @param videoElement
   */
  private cleanVideoSource(videoElement: HTMLVideoElement): void {

    try {
      videoElement.srcObject = null;
    } catch (err) {
      videoElement.src = '';
    }

    this.videoElement.removeAttribute('src');
  }
}

export default AcBrowserQRCodeReader;