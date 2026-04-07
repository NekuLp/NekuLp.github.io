let palette = ['#d24d28', '#e2b007', '#3056a3', '#1d3557', '#7a1a0a', '#f2d3b3'];

function setup() {
  createCanvas(1080, 1080);
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);
  initSketch();
}

function initSketch() {
  background('#f0f0f0');
  for (let i = 0; i < 120; i++) {
    volumeStroke(random(width), random(height));
  }
}

function volumeStroke(x, y) {
  let col = color(random(palette));
  let h = hue(col);
  let s = saturation(col);
  let b = brightness(col);

  let angle = random(TWO_PI);
  let len = random(60, 380);
  let noiseSeedVal = random(1000);
  let brushSize = random(25, 55);
  let px = x, py = y;

  for (let t = 0; t < len; t++) {
    let n = noise(noiseSeedVal + t * 0.01);
    angle += map(n, 0, 1, -0.3, 0.3);
    px += cos(angle) * 2;
    py += sin(angle) * 2;

    let prog = t / len;
    let size = brushSize * (1.0 - prog * 0.7);

    // base color
    let base = color(h, s, b * 0.6);
    let mid = color(h, s, b * 1.0);
    let highlight = color(h, s * 0.4, min(b * 1.8, 100));

    // shadow base
    fill(base);
    ellipse(px + cos(angle + PI / 2) * 2, py + sin(angle + PI / 2) * 2, size * 1.05);

    // body of the paint
    fill(mid);
    ellipse(px, py, size);

    // top highlight
    fill(highlight);
    ellipse(px + cos(angle - PI / 2) * 2, py + sin(angle - PI / 2) * 2, size * 0.85);

    // trail fade — makes it feel like brush lifting
    if (random() < 0.2) {
      fill(h, s, b, 60 * (1 - prog));
      ellipse(px, py, size * random(0.8, 1.1));
    }
  }
}

function mousePressed() {
  initSketch();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    initSketch();
  }
  if (key === 's' || key === 'S') {
    saveCanvas('oil-paint-2', 'png');
  }
}
