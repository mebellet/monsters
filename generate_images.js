const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

function createImg(filename, bg, fg, text) {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(100, 100, 80, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.font = '40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 100, 100);

  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(dir, filename), buffer);
}

createImg('pos1.jpeg', 'lightblue', 'green', ':-)');
createImg('pos2.jpeg', 'lightgreen', 'blue', ':-)');
createImg('neg1.jpeg', 'pink', 'red', '>:(');
createImg('neg2.jpeg', 'lightcoral', 'darkred', '>:(');

// Football
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 200, 200);
ctx.fillStyle = 'black';
ctx.beginPath();
ctx.arc(100, 100, 80, 0, 2 * Math.PI);
ctx.fill();
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(100, 100, 60, 0, 2 * Math.PI);
ctx.fill();
ctx.fillStyle = 'black';
ctx.beginPath();
ctx.arc(100, 100, 40, 0, 2 * Math.PI);
ctx.fill();
fs.writeFileSync(path.join(dir, 'football.jpeg'), canvas.toBuffer('image/jpeg'));

console.log('Images generated!');
