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
  console.log('Cos? '+cosTru);

  console.log('gridSize: '+gridSize);
  console.log('waveFrequency Y:'+waveFrequency);
  console.log('waveFrequency X:'+waveFrequencyX);
  
  console.log('waveAmplitude Y: '+waveAmplitude);
  console.log('waveAmplitude X: '+waveAmplitudeX);
  console.log('Red value: '+red);
  console.log('Green value: '+green);
  console.log('Blue value: '+blue);

  // Define the palette gradient from yellow to white
  for (let i = 0; i < stages; i++) {
    let inter = map(i, 0, stages - 1, 0, PI); // Map to the range of 0 to PI
    let r = map(sin(inter), -1, 1, red, 1); // Smoothly change red component
    let g = map(sin(inter), -1, 1, green, 1); // Smoothly change green component
    let b;
    if(cosTru == 1){
      b = map(cos(inter), -1, 1, blue, 1); // Keep blue component constant
      console.log('cos');
    }else{
      b = map(sin(inter), -1, 1, blue, 1); // Keep blue component constant
      console.log('sin');
    }
    
    palette.push(color(r, g, b));
  }
  background(0);

  noStroke();
  frameRate(30); // Adjust the frame rate as needed
  rectMode(CORNER);
}

function draw() {
  background(color(red, green, blue));
  translate(-40,-40)
  for (let x = 0; x < width + 70; x += gridSize) {
    for (let y = 0; y < (height+70); y += gridSize) {
      let yOffset = waveAmplitude * cos(waveFrequency * (x + frameCount)); // Calculate the vertical offset
      let xOffset = waveAmplitudeX * cos(waveFrequencyX * (y + frameCount)); // Calculate the vertical offset
      let index = floor(frameCount / 2) % palette.length; // Change color every 2 frames
      let fillColor = palette[(index + x + y) % palette.length];
      fillColor.setAlpha(255 + 80 * sin(millis() / 3000))
      fill(fillColor);
      //rect(x, y + yOffset, gridSize, gridSize);
      //rect(x + xOffset, y, gridSize, gridSize);
      rect(x + xOffset, y + yOffset, gridSize, gridSize);
    }
  }
}

function windowResized() {
  redraw();
  resizeCanvas(windowWidth, windowHeight);
  
}