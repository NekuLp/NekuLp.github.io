let palette = [];
let stages = 25;
let gridSize = 14;
let waveAmplitude = 22; // Adjust the amplitude of the wave 10 -30
let waveFrequency = 0.019; // Adjust the frequency of the wave 0.02 -0.07
let waveAmplitudeX = 22; // Adjust the amplitude of the wave 10 -30
let waveFrequencyX = 0.019; // Adjust the frequency of the wave 0.02 -0.07

var red,green,blue;

var cosTru = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initSketch();
  noStroke();
  frameRate(30); 
  rectMode(CORNER);
}

function initSketch() {
  palette = [];
  // override variables to random
  gridSize = int(random(10,24));
  waveAmplitude = int(random(10,30));
  waveFrequency = random(0.02,0.07);

  waveAmplitudeX = int(random(10,50));
  waveFrequencyX = random(0.02,0.07);

  red = random(0,255);
  green = random(0,255);
  blue = random(0,255);

  cosTru = int(random(0,2));
  
  // Define the palette gradient
  for (let i = 0; i < stages; i++) {
    let inter = map(i, 0, stages - 1, 0, PI); 
    let r = map(sin(inter), -1, 1, red, 1); 
    let g = map(sin(inter), -1, 1, green, 1); 
    let b;
    if(cosTru == 1){
      b = map(cos(inter), -1, 1, blue, 1); 
    }else{
      b = map(sin(inter), -1, 1, blue, 1); 
    }
    palette.push(color(r, g, b));
  }
}

function draw() {
  background(color(red, green, blue));
  translate(-40,-40)
  for (let x = 0; x < width + 70; x += gridSize) {
    for (let y = 0; y < (height+70); y += gridSize) {
      let yOffset = waveAmplitude * cos(waveFrequency * (x + frameCount)); 
      let xOffset = waveAmplitudeX * cos(waveFrequencyX * (y + frameCount)); 
      let index = floor(frameCount / 2) % palette.length; 
      let fillColor = palette[(index + x + y) % palette.length];
      fillColor.setAlpha(255 + 80 * sin(millis() / 3000))
      fill(fillColor);
      rect(x + xOffset, y + yOffset, gridSize, gridSize);
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}