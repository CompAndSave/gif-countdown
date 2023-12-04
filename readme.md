# Library to generate GIF countdown with customized background image and font

## Features
* Generate animated GIF with your preferred background image, font and countdown text
* Show different image when the counter is zero / expired
* For advanced use, frame delay, number of frames, number of times to repeat, gif quality and number of seconds count down can be configured

## How to Use - See example folder for details
```js
const GifCountdown = require("gif-countdown");
const path = require("path");

const gifCountdown = new GifCountdown();
await gifCountdown.loadImage(path.join(__dirname, "./assets/images/bg.png"));

// Optional - To add image when counter is to zero
// Note: It has been loaded after loadImage() and the expired image size has to be equal to counter background image
//
await gifCountdown.loadExpiredImage(path.join(__dirname, "./assets/images/expired_image.png"));

await gifCountdown.registerFontText(
  path.join(__dirname, "./assets/fonts/OpenSans-Bold.ttf"),
  "Open Sans", 40,
  (counter)=> ` ${counter.days}       ${counter.hours}       ${counter.minutes}       ${counter.seconds}`,
  "rgb(163, 168, 178)", 25, 49
);
await gifCountdown.generate("2023-01-01T23:59:59-08:00");
```

![alt text](https://raw.githubusercontent.com/CompAndSave/gif-countdown/master/example/output/output.gif)

## Sample Usage
1. Create a serverless api to serve animated countdown GIF for email campaign - https://github.com/CompAndSave/email-countdown-serverless