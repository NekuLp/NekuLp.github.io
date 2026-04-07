
let f = 0;
let value = 0;
let clicked = 0;
let x = 0;
let y = 0;
let frameOffset = 0;

function Super_Tornado(t) {
  let ratio = t * 0.004;
  let points = [];
  for (let i = 0; i <= 600; i += 0.1) {
    let theta = radians(i * ratio);
    x = cos(0.5 * theta) * i * (tan(i) + 0.8);
    y = sin(1 / theta) * (i) * (tan(i));
    fill(color(255, theta * 15, 0, 120));
    ellipse(x, y, 3, 3);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  initSketch();
}

function initSketch() {
  frameOffset = frameCount;
  clicked = 0;
  value = 0;
}

function draw() {
  background(0);
  translate(width / 2, height / 2);
  let t = frameCount - frameOffset;
  Super_Tornado(t);
}

function mouseClicked() {
  if (clicked < 5) {
    clicked++;
    value++;
  } else {
    clicked = 0;
    value = 0;
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    initSketch();
  }
  if (key === 's' || key === 'S') {
    saveCanvas('genuary2024-1-particles', 'png');
  }
}