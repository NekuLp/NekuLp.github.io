let xoff = 0.0;
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


function setup() {
  seed = int(random(0,100000));
  createCanvas(windowWidth, windowHeight);
  noiseSeed(seed);
  colorMode(RGB);
  background('#000000');

  noFill();
  rectMode(CENTER);

  posX = width / 2;
  posY = height / 2;
  //stroke('rgba(255,0,0,0.05)');
  // randomOffsetX = (width - random(width));
  // randomOffsetY = (height - random(height));
  
  r1 = int(random(0,255));
  g1 = int(random(0,255));
  b1 = int(random(0,255));
  r2 = int(random(0,255));
  g2 = int(random(0,255));
  b2 = int(random(0,255));

  //console.log(seed);
  //console.log(direction);
  console.log('r1 '+r1)
  console.log('g1 '+g1)
  console.log('b1 '+b1)
  console.log('r2 '+r2)
  console.log('g2 '+g2)
  console.log('b2 '+b2)


  if(r1+g1+b1 < 250){
    
  }
}



function draw() {
  xoff = xoff + .01;
  posX += 1;
  posY += 1;
  let n = noise(xoff) * (width);
  let y = noise(xoff+1) * (height);
  let s = noise(xoff+0.5) * (width);
  

  let from2 = color(r1, g1, b1, 90);
  let to2 = color(r2, g2, b2, 90);

  seno2 = (sin(radians(frameCount)) * 1);

  let interB = lerpColor(from2, to2, seno2); 

  // if(seno < 0 ){
  //   frameCount = 0;
  // }

  //rectMode(CENTER);
  stroke(interB);  
  // square(posX, posY, n, 50 + xoff);
  
  
  square(n, y, s/3, 30 + xoff);
  
  
  if (((posX+seno2)) > width) posX = 0;
  if (posX < 0 ) posX = width;
  if (posY < 0) posY = height;
  if (posY > height) posY = 0;  
}

function keyPressed() {    

  if (keyCode === LEFT_ARROW) {
    noLoop();
  } else if (keyCode === RIGHT_ARROW) {
    loop();
  }

  if (key == 's' || key == 'S') saveCanvas('noiseportalpic2', 'png');    
}