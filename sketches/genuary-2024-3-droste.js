let drosteLayers = 100;
let rotationSpeed = 0.00001;
let colorOffset = 0;
let blendModes = ['BLEND', 'ADD', 'DARKEST', 'LIGHTEST', 'DIFFERENCE', 'EXCLUSION'];
let blends = [];
let greenColor;
let blueColor;

function setup() {
  createCanvas(1080, 1080);
  initSketch();
}

function initSketch() {
  blends = [];
  for (let i = 0; i < drosteLayers; i++) {
    blends.push(random(blendModes));
  }
  greenColor = random(0, 255);
  blueColor = random(0, 255);
  colorOffset = 0;
}

function draw() {
  background(20);
  // Apply the Droste effect with rotating triangles
  applyDrosteEffect(width / 4, height / 4, width / 2, height / 2, drosteLayers);
}

function applyDrosteEffect(x, y, w, h, levels) {
  for (let i = 0; i < levels; i++) {
    // Draw a rotating triangle at the current position
    push();
    blendMode(ADD);
    translate(x + w / 2, y + h / 2);
    rotate(frameCount * (rotationSpeed + (i / 700)));

    let triangleSize = w * 1.6;
    let fillColor = color((i * 30 + colorOffset) % 255, greenColor, blueColor, 255);
    let fillStroke = color('beige');
    fillColor.setAlpha(20 + (i * 4));
    fillStroke.setAlpha(10 + (i * 7));

    fill(fillColor);
    stroke(fillStroke);
    square(-triangleSize / 2, -triangleSize / 2, triangleSize)
    pop();

    // Calculate the position and size for the next layer
    let nextX = x + w * 0.1;
    let nextY = y + h * 0.1;
    let nextW = w * 0.8;
    let nextH = h * 0.8;

    x = nextX;
    y = nextY;
    w = nextW;
    h = nextH;

    // Update color offset for variation
    colorOffset += 5;
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    noLoop();
  } else if (keyCode === RIGHT_ARROW) {
    loop();
  }

  if (key === 'r' || key === 'R') {
    initSketch();
  }

  if (key == 's' || key == 'S') {
    saveCanvas('genuary3-DrosteEffect', 'png');
    console.log('ua');
  }
}