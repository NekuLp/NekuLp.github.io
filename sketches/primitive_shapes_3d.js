
var seno2 = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noFill();
  
}

function draw() {
  background(0);  
  //rotateY(frameCount * 0.01);  
  seno2 = (sin(radians(frameCount)) * 1);

  let opacity1 = 40
  let opacity2 = 60

  let from2 = color(255, 255, 152, opacity1);
  let to2 = color(15,0, 255, opacity2);
  let interB = lerpColor(from2, to2, seno2);
  
  // Set camera point in the middle of tunnel
  rotateX(88.8);
  rotateY(17.4);

  for (let j = 0; j < 10; j++) {
    push();
    stroke(interB);
    for (let i = 0; i < 80; i++) {
         translate(
           sin(frameCount * 0.001 + j) * 100,
           sin(frameCount * 0.001 + j) * 100,
           i * 0.1
         );
      //rotateZ(frameCount * 0.01);
      push();
      sphere( (windowWidth*150)/350, 24, 20);
      pop();
    }
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}