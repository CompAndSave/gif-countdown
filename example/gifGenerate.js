const GifCountdown = require("gif-countdown");
const path = require("path");

const gifCountdown = new GifCountdown();
await gifCountdown.loadImage(path.join(__dirname, "./assets/images/bg.png"));
await gifCountdown.registerFontText(
  path.join(__dirname, "./assets/fonts/OpenSans-Bold.ttf"),
  "Open Sans", 40,
  (counter)=> ` ${counter.days}       ${counter.hours}       ${counter.minutes}       ${counter.seconds}`,
  "rgb(163, 168, 178)", 25, 49
);
await gifCountdown.generate(path.join(__dirname, "./output/output.gif"), "2023-01-01T23:59:59");