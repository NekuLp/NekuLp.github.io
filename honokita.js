var fillColor;
var font
let theText = "Te amo Honokita";
let scalar = 0.9; //a made up number for each font
var leading
var asc
var tSize

function preload(){
    font = loadFont("Rubik-VariableFont_wght.ttf")
    
  }

function setup() {
  createCanvas(windowWidth, windowHeight);
  tSize = (windowWidth/5);
  textSize(tSize);
  textLeading(200);
  textStyle(NORMAL);
  textWrap(WORD);
  textAlign(CENTER, CENTER);
  strokeWeight(20)
  stroke('red');


  //textFont(font);
  background(173, 237, 173);

  //noFill();
  //fillColor = color('rgb(26, 255, 145)');  
  
}

function draw() {
    background(173, 237, 173);
    text(theText, 0, 0, width, height)
}

function windowResized() {
    redraw();
    resizeCanvas(windowWidth, windowHeight);    
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    noLoop();
  } else if (keyCode === RIGHT_ARROW) {
    loop();
  }

  if (key == 's' || key == 'S'){
   saveCanvas('genuary5-Vera', 'png');
   console.log('ua');
  } 

  
}