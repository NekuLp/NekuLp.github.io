let xoff = 0.0;
let xoffY = 100.0;
let xoffS = 4.0;
let hue = 0;

var posX;
var posY;

var randomOffsetX;
var randomOffsetY;

var seno2 = 0;

var direction; 
var seed;

var r1;
var g1;
var b1;

var r2;
var g2;
var b2;

var energy = 0;
var limit = 100;
var colorR = 0;
var colorG = 0;
var colorB = 0;

var alpha2 = 0;


function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 5000);
  frameRate(60);
  noStroke();
  initSketch();
}

function initSketch() {
  seed = int(random(0,100000));
  noiseSeed(seed);
  background(500, 500, 500);
  
  colorR = int(random(0,255));
  colorG = int(random(0,255));
  colorB = int(random(0,255));

  limit = int(random(200,1200));
  
  xoff = 0.0;
  xoffY = 100.0;
  xoffS = 4.0;
  energy = 0;
  alpha2 = 0;
  frameCount = 0;
}




function draw() {
  xoff = xoff + .010;
  xoffY = xoffY + .009;
  xoffS = xoffS + .12;
  energy = energy + 20;
  alpha2 = alpha2 + 0.7;
  //background(0, 0, 0, 100);

  let n = noise(xoff) * (width);
  let y = noise(xoffY) * (height);
  let s = noise(xoffS) * (20);
  
  fill('rgba('+colorR+','+colorG+','+colorB+',1)');  
  // square(posX, posY, n, 50 + xoff);
  
  circle(n,y, s);
  

  if(energy > limit){
    xoff = xoff + 2;
    xoffY = xoffY + 2;
    xoffS = 4;

    energy = 0;
    limit = int(random(200,1000));
    colorR = int(random(40,255));
    colorG = int(random(40,255));
    colorB = int(random(40,255));
    console.log(colorR);
    console.log(colorG);
    console.log(colorB);
    console.log('Initialize drawing agent');
    //background(0,0,0,100);
  }

  if(alpha2 == 255){
    alpha2 = 0;
    console.log('alpha 255');
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
    loop();
  }

  if (key == 's' || key == 'S') saveCanvas('Doodles', 'png');    
}
