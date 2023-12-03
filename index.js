'use strict';

const { GifEncoder } = require('@skyra/gifenc');
const { buffer } = require('node:stream/consumers');
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
   * @param {object} fontText
   * @param {string} fontText.font_path Font path
   * @param {string} fontText.font_name Font family name, e.g., `Open Sans`
   * @param {string|number} fontText.font_size Font size in pixel, e.g., `40`
   * @param {function} fontText.text_fn Function to generate the text string by timer parameter. E.g., ``` (counter)=> `${counter.days} : ${counter.hours} : ${counter.minutes} : ${counter.seconds}` ```
   * @param {string} fontText.text_color Color string for text. E.g., `rgb(163, 168, 178)`
   * @param {number} fontText.text_x_offset X coordinate offset for text
   * @param {number} fontText.text_y_offset Y coordinate offset for text
   */
  async registerFontText(fontText) {
    if (!fontText) { throw new Error("fontText object is not provided");}
    if (!fontText.font_path) { throw new Error("font_path is not provided"); }
    if (!fontText.font_name) { throw new Error("font_name is not provided"); }
    if (!fontText.font_size) { throw new Error("font_size is not provided"); }
    if (!fontText.text_fn) { throw new Error("text_fn is not provided"); }
    if (!fontText.text_color) { throw new Error("text_color is not provided"); }
    if (!fontText.text_x_offset) { throw new Error("text_x_offset is not provided"); }
    if (!fontText.text_y_offset) { throw new Error("text_y_offset is not provided"); }

    registerFont(fontText.font_path, { family: fontText.font_name });
    this.fontText = fontText;
  }

  /**
   * Generate the gif
   * 
   * @param {string} expDateTime Expiration date time. ISO format, e.g., 2023-01-01T23:59:59
   * @param {string} [fromDate] Count from date time. If not provided, current date time will be used
   * @returns {promise} Promise with gif data buffer
   */
  async generate(expDateTime, fromDateTime) {
    if (!this.image) { throw new Error("Background image is not loaded. Run loadImage() first"); }
    if (!this.fontText) { throw new Error("Font and text are not configured. Run registerFontText() first"); }
  
    const counter = new DateTimeCounter(expDateTime, fromDateTime);
    const frames = [], delays = [];

    for (let i = 0; i <= this.numFrames; i++) {
      frames.push(this.#createFrame(counter.getStringValue()));
      delays.push(this.delay);
      counter.secondDown(this.numSecondDown);
    }

    const encoder = new GifEncoder(this.imageWidth, this.imageHeight);
    const stream = encoder.createReadStream();
    encoder.setRepeat(this.gifNumRepeat).setDelay(this.delay).setQuality(this.gifQuality).start();
    
    frames.forEach(frame => encoder.addFrame(frame));
    
    encoder.finish();
    return await buffer(stream);
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

    const text = this.fontText.text_fn(counter);
    ctx.font = `${this.fontText.font_size}px "${this.fontText.font_name}"`;
    ctx.fillStyle = this.fontText.text_color;
    ctx.fillText(text, this.fontText.text_x_offset, this.fontText.text_y_offset);

    return ctx;
  }
}

module.exports = GifCountdown;