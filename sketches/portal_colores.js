let xoff = 0.0;
let hue = 0;

var posX;
var posY;

var randomOffsetX;
var randomOffsetY;

var direction; 
var seed;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255);
  initSketch();
}

function initSketch() {
  seed = int(random(0,10000));
  noiseSeed(seed);
  background('#000000');

  noFill();
  rectMode(CENTER);

  posX = width / 2;
  posY = height / 2;
 
  direction = 2;  

  console.log(seed);
  console.log(direction);
  
  xoff = 0.0;
  frameCount = 0;
}



function draw() {
  xoff = xoff + .01;
  posX += 1;
  posY += 1;
  let n = noise(xoff) * (width);
  if(frameCount== 360){
    frameCount = 0;
  }  
  stroke((hue + frameCount), 255, 255, 60);
  //stroke('rgba(255,0,0,0.05)');
  
  // square(posX, posY, n, 50 + xoff);

  if(direction == 1){
    square((posX + n) - (width/2), posY, n, 50 + xoff);
  }else if(direction == 2){
    square((posX + n) - (width/2), (posY +n) - (height/2), n, 50 + xoff);
  }else{
    square(posX, posY, n, 50 + xoff);
  }
  
  if (posX > width) posX = 0;
  if (posX < 0 ) posX = width;
  if (posY < 0) posY = height;
  if (posY > height) posY = 0;
  //describe(`vertical grey lines drawing in pattern affected by noise.`);
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

  if (key == 's' || key == 'S') saveCanvas('noiseportalpic', 'png');    
}