'use strict';

const GIFEncoder = require("gif-encoder-2");
const fs = require("fs");
const { loadImage, createCanvas, registerFont } = require("canvas");
const DateTimeCounter = require("./lib/DateTimeCounter");

class GifCountdown {

  /**
   * @class
   * @classdesc Library to generate GIF countdown with customized background image and font
   * 
   * @param {number} [frameDelay=1000] Delay in milliseond between frames in GIF. Default is `1000`
   * @param {number} [numFrames=60] Number of frames at gif. Default is `60`
   * @param {number} [gifNumRepeat=0] Number of times to repeat (0 for infinite). Default is `0`
   * @param {number} [gifQuality=10] Gif quality. Default is `10`
   * @param {number} [numSecondDown=1] Number of seconds decrease per frame. Default is `1`
   */
  constructor(frameDelay = 1000, numFrames = 60, gifNumRepeat = 0, gifQuality = 10, numSecondDown = 1) {
    this.delay = frameDelay;
    this.numFrames = numFrames;
    this.gifNumRepeat = gifNumRepeat;
    this.gifQuality = gifQuality;
    this.numSecondDown = numSecondDown;
  }

  /**
   * Load counter background image
   * 
   * @param {string} imagePath Image path
   */
  async loadImage(imagePath) {
    this.image = await loadImage(imagePath);
    this.imageWidth = this.image.width;
    this.imageHeight = this.image.height;
  }

  /**
   * Register font and text setting
   * 
   * @param {string} fontPath Font path
   * @param {string} fontName Font family name, e.g., `Open Sans`
   * @param {string|number} fontSize Font size in pixel, e.g., `40`
   * @param {function} textFn Function to generate the text string by timer parameter. E.g., ``` (counter)=> `${counter.days} : ${counter.hours} : ${counter.minutes} : ${counter.seconds}` ```
   * @param {string} textColor Color string for text. E.g., `rgb(163, 168, 178)`
   * @param {number} textXoffset X coordinate offset for text
   * @param {number} textYoffset Y coordinate offset for text
   */
  async registerFontText(fontPath, fontName, fontSize, textFn, textColor, textXoffset, textYoffset) {
    if (!fontPath) { throw new Error("fontPath is not provided"); }
    if (!fontName) { throw new Error("fontName is not provided"); }
    if (!fontSize) { throw new Error("fontSize is not provided"); }
    if (!textFn) { throw new Error("textFn is not provided"); }
    if (!textXoffset) { throw new Error("textXoffset is not provided"); }
    if (!textYoffset) { throw new Error("textYoffset is not provided"); }

    registerFont(fontPath, { family: fontName });
    this.fontName = fontName;
    this.fontSize = fontSize.toString();
    this.textFn = textFn;
    this.textColor = textColor;
    this.textXoffset = textXoffset;
    this.textYoffset = textYoffset;
  }

  /**
   * Generate the gif
   * 
   * @param {string} outputPathName Output file path and name
   * @param {string} expDateTime Expiration date time. ISO format, e.g., 2023-01-01T23:59:59
   * @param {string} [fromDate] Count from date time. If not provided, current date time will be used
   * @returns {promise}
   */
  async generate(outputPathName, expDateTime, fromDateTime) {
    if (!this.image) { throw new Error("Background image is not loaded. Run loadImage() first"); }
    if (!this.fontName) { throw new Error("Font and text are not configured. Run registerFontText() first"); }

    const ws = fs.createWriteStream(outputPathName);
  
    const counter = new DateTimeCounter(expDateTime, fromDateTime);
    const frames = [], delays = [];

    for (let i = 0; i <= this.numFrames; i++) {
      frames.push(this.#createFrame(counter.getStringValue()));
      delays.push(this.delay);
      counter.secondDown(1);
    }

    const encoder = new GIFEncoder(this.imageWidth, this.imageHeight);
    encoder.createReadStream().pipe(ws);
  
    encoder.start();
    encoder.setRepeat(this.gifNumRepeat);
    encoder.setDelay(this.delay);
    encoder.setQuality(this.gifQuality);
  
    frames.forEach(frame => encoder.addFrame(frame)); 
    encoder.finish();
  
    return new Promise((resolve)=> ws.on("finish", ()=> resolve()));
  }

  /**
   * Create canvas frame
   * 
   * @param {DateTimeCounter} counter Counter
   * @returns {CanvasRenderingContext2D}
   */
  #createFrame(counter) {
    const canvas = createCanvas(this.imageWidth, this.imageHeight);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);

    const text = this.textFn(counter);
    ctx.font = `${this.fontSize}px "${this.fontName}"`;
    ctx.fillStyle = this.textColor;
    ctx.fillText(text, this.textXoffset, this.textYoffset);

    return ctx;
  }
}

module.exports = GifCountdown;