let OCC_GRID_SIZE = 4; // 4x4 pixels per cell (tweakable)
let occCols, occRows;
let occGrid;


// --- CONFIG ---
const PIXEL_SIZE = 64;        // internal sprite resolution
const SCALE = 4;              // enlarge pixels
const CYCLE_INTERVAL = 2;   // palette cycle timing

let cycleTimer = 0;
let palette;

let craters = [];             // list of crater objects

const NUM_CRATERS = 25;        // try 20 or even 50 after optimization!

function setup() {
  createCanvas(1080, 1080);
  noSmooth();

  generatePalette();
  initSketch();
}

function initSketch() {
  craters = [];
  // Create all craters
  for (let i = 0; i < NUM_CRATERS; i++) {
    craters.push(makeCrater());
  }
}

function draw() {
  background(0);

  cyclePalette();

  // draw all craters
  craters
  .slice()
  .sort((a, b) => a.footprint - b.footprint)
  .forEach(drawCrater);

}

function makeCrater() {
  

  let size = floor(random(48, 96));
  let mask = create2DArray(size, size);
  let buffer = create2DArray(size, size);

  let noiseScale = random(0.02, 1.11);
  let noiseAmp   = random(4, 24);
  let baseCircle = random(0.001, 0.2);
  let warpX      = random(0.5, 1.2);
  let warpY      = random(0.5, 1.2);

  generateAbstractCraterMask(mask, baseCircle, noiseScale, noiseAmp, warpX, warpY);
  initializePixels(mask, buffer);

  let gfx = createGraphics(size * SCALE, size * SCALE);
  gfx.noSmooth();

  rebuildCraterGraphics({
    size,
    buffer,
    gfx
  });

  let drawRadius = (size * SCALE) / 2;
  let crust = drawRadius * random(0.25, 5.9);//ESTOOOOO

  // ✅ RECTANGULAR footprint (keep this)
  let pad = 16;
  let footprint = drawRadius * 0.2 + 32;//ESTOOOO


  // ✅ THIS WAS MISSING
  let pos = placeCrater(drawRadius, footprint, craters);
  let cx = pos.cx;
  let cy = pos.cy;

  return {
    cx,
    cy,    
    size,
    mask,
    buffer,
    gfx,
    footprint,
    crust
  };
}




function generatePalette() {
  palette = [
    color(30, 0, 0),
    color(60, 0, 0),
    color(100, 0, 0),
    color(150, 10, 0),
    color(200, 30, 0),
    color(240, 60, 0),
    color(255, 100, 0),
    color(255, 150, 0),
    color(255, 200, 50),
    color(255, 230, 90),
    color(255, 200, 50),
    color(255, 150, 0),
    color(240, 60, 0),
    color(200, 30, 0),
    color(150, 10, 0),
    color(100, 0, 0)
  ];
}

function cyclePalette() {
  cycleTimer++;
  if (cycleTimer >= CYCLE_INTERVAL) {
    cycleTimer = 0;

    // rotate palette
    let last = palette.pop();
    palette.unshift(last);

    // redraw each crater's buffer -> gfx
    for (let c of craters) {
      rebuildCraterGraphics(c);
    }
  }
}

function rebuildCraterGraphics(c) {
  let gfx = c.gfx;
  gfx.background(0, 0);

  for (let y = 0; y < c.size; y++) {
    for (let x = 0; x < c.size; x++) {

      let idx = c.buffer[x][y];
      if (idx === -1) continue;

      gfx.fill(palette[idx % palette.length]);
      gfx.noStroke();
      gfx.rect(x * SCALE, y * SCALE, SCALE, SCALE);
    }
  }
}


function generateCraterMask(mask) {
  noiseDetail(2, 0.5);

  let cx = PIXEL_SIZE / 2;
  let cy = PIXEL_SIZE / 2;
  let maxR = PIXEL_SIZE * 9.35;

  for (let y = 0; y < PIXEL_SIZE; y++) {
    for (let x = 0; x < PIXEL_SIZE; x++) {
      let dx = x - cx;
      let dy = y - cy;
      let dist = sqrt(dx * dx + dy * dy);

      let r = maxR + noise(x * 0.1, y * 0.1) * 10 - 5;
      mask[x][y] = dist < r;
    }
  }
}

function initializePixels(mask, buffer) {
  let size = mask.length;  // dynamic crater size

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {

      if (mask[x][y]) {
        let idx = floor(noise(x * 0.12, y * 0.12) * palette.length);
        buffer[x][y] = idx;
      } else {
        buffer[x][y] = -1;
      }

    }
  }
}


function drawCrater(c) {
  let drawRadius = (c.size * SCALE) / 2;

  // --- pressure shadow (DEPTH) ---
  noStroke();
  fill(6, 0, 0, 0); // dark SNES lava soil

  ellipse(
    c.cx,
    c.cy,
    drawRadius * 2 + c.crust * 2,
    drawRadius * 2 + c.crust * 2
  );

  // --- lava crater ---
  image(
    c.gfx,
    c.cx - drawRadius,
    c.cy - drawRadius
  );
}





function create2DArray(w, h) {
  let arr = new Array(w);
  for (let i = 0; i < w; i++) {
    arr[i] = new Array(h);
  }
  return arr;
}

function placeCrater(drawRadius, footprint, others) {
  const CELL = footprint * 0.9; // controls natural spacing

  // bias candidates to a loose grid
  for (let attempts = 0; attempts < 3000; attempts++) {

    let gx = floor(random(width / CELL));
    let gy = floor(random(height / CELL));

    let cx = gx * CELL + CELL * 0.5 + random(-CELL * 0.25, CELL * 0.25);
    let cy = gy * CELL + CELL * 0.5 + random(-CELL * 0.25, CELL * 0.25);

    if (
      cx < drawRadius ||
      cy < drawRadius ||
      cx > width - drawRadius ||
      cy > height - drawRadius
    ) continue;

    let ok = true;

    for (let o of others) {
      let dx = cx - o.cx;
      let dy = cy - o.cy;
      let d = sqrt(dx * dx + dy * dy);

      if (d < footprint + o.footprint) {
        ok = false;
        break;
      }
    }

    if (ok) return { cx, cy };
  }

  // fallback
  return {
    cx: random(drawRadius, width - drawRadius),
    cy: random(drawRadius, height - drawRadius)
  };
}









function generateAbstractCraterMask(mask, baseCircle, noiseScale, noiseAmp, warpX, warpY) {
  let size = mask.length;
  let cx = size / 2;
  let cy = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {

      // warping for ovals and stretched cracks
      let dx = (x - cx) * warpX;
      let dy = (y - cy) * warpY;

      let dist = sqrt(dx*dx + dy*dy);

      let maxR = size * baseCircle;

      // noisy radius variation
      let r = maxR + noise(x * noiseScale, y * noiseScale) * noiseAmp - noiseAmp/2;

      mask[x][y] = dist < r;
    }
  }
}



function computeFootprintRadius(mask) {
  let size = mask.length;
  let cx = size / 2;
  let cy = size / 2;

  let maxDist = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!mask[x][y]) continue;

      let dx = x - cx;
      let dy = y - cy;
      let d = sqrt(dx * dx + dy * dy);

      if (d > maxDist) maxDist = d;
    }
  }

  // scale to screen space
  return maxDist * SCALE;
}

function mousePressed() {
  initSketch();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    initSketch();
  }
  if (key === 's' || key === 'S') {
    saveCanvas('palette-cycling-lava', 'png');
  }
}
