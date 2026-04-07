let paintLayer;
let densityLayer;


function setup() {
  createCanvas(800, 800);
  noStroke();
  paintLayer = createGraphics(width, height);
  densityLayer = createGraphics(width, height);
  initSketch();
}

function initSketch() {
  paintLayer.background(240);
  densityLayer.background(0);
  clear(); // Clear the main canvas

  for (let i = 0; i < 80; i++) {
    let x = random(width);
    let y = random(height);
    let col = color(random(['#d83c3c', '#e0a458', '#224870', '#6b2d5c', '#eae2b7']));
    drawBrushStroke(paintLayer, densityLayer, x, y, col);
  }

  // Apply “lighting” based on paint density
  image(paintLayer, 0, 0);
  applyLighting(densityLayer);
}

function drawBrushStroke(pg, dg, x, y, col) {
  let len = random(50, 200);
  let angle = random(TWO_PI);
  let dx = cos(angle);
  let dy = sin(angle);

  for (let i = 0; i < len; i++) {
    let px = x + dx * i + random(-5, 5);
    let py = y + dy * i + random(-5, 5);
    let r = random(10, 30);
    
    let c = color(
      red(col) + random(-15, 15),
      green(col) + random(-15, 15),
      blue(col) + random(-15, 15),
      100
    );
    
    // Paint layer (color)
    pg.fill(c);
    pg.ellipse(px, py, r, r * random(0.6, 1.2));

    // Density layer (thickness)
    //dg.noStroke();
    //dg.fill(255, 10); // small addition per stroke
    //dg.ellipse(px, py, r * 0.8);
  }
}

function applyLighting(density) {
  loadPixels();
  density.loadPixels();
  
  for (let i = 0; i < pixels.length; i += 4) {
    let d = density.pixels[i]; // thickness (0–255)
    // fake lighting: darker and warmer where thicker
    pixels[i] = pixels[i] * (0.8 + d / 800); // R
    pixels[i + 1] = pixels[i + 1] * (0.8 + d / 900); // G
    pixels[i + 2] = pixels[i + 2] * (0.8 + d / 1200); // B
  }
  updatePixels();
}

function mousePressed() {
  initSketch();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    initSketch();
  }
  if (key === 's' || key === 'S') {
    saveCanvas('test-unnamed', 'png');
  }
}