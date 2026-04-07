var fillColor;
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  //noFill();
  fillColor = color('rgb(26, 255, 145)');

  
  stroke('#f72228');
}

function draw() {
  translate(width / 2, height / 2);

  // Set up parameters
  let numCircles = 720;
  let circleRadius = (windowWidth*windowHeight)/8000;
  let lineLength =  (windowWidth*windowHeight)/8000;

  // Draw circles and lines
  for (let i = 0; i < numCircles; i++) {
    let angle = map(i, 0, numCircles, 0, TWO_PI);
    let x = cos(angle) * circleRadius;
    let y = sin(angle) * circleRadius;
    let cop = numCircles/i;

    // Draw circles
    console.log('percentage: '+(100 * i) / numCircles)
    //console.log(cop);
    fillColor.setAlpha(55 - ((100 * i) / numCircles));
    fill(fillColor);    
    ellipse(x, y, circleRadius * 2);

    // Draw lines
    let lineStartX = cos(angle) * (circleRadius + 5);// manipula posicion inicial de lineas dentro esfera
    let lineStartY = sin(angle) * (circleRadius + 1);
    
    let lineEndX = cos(angle) * (circleRadius + lineLength - 350);//manipula las ondas y lineas dentro de la esfera
    let lineEndY = sin(angle) * (circleRadius + lineLength - 350);

    line(lineStartX, lineStartY, lineEndX, lineEndY);

    noLoop();
  }
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