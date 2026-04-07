let sprites = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255)
  noLoop();
  initSketch();
}

function initSketch() {
  sprites = [];
  for (let i = 0; i < 150; i++) {
    sprites.push(new Sprite(random(width), random(height)));
  }
  redraw();
}

function draw() {
  background(20);

  for (let sprite of sprites) {
    sprite.display();
  }
}

class Sprite {
  constructor(x, y) {
    // Introduce randomness in the initial position
    this.x = x + random(-50, 50);
    this.y = y + random(-50, 50);
    this.size = 16;
    this.colors = [
      color(int(random(0,255)), int(random(0,255)), int(random(0,255))),
      color(int(random(0,255)), int(random(0,255)), int(random(0,255))),
      color(int(random(0,255)), int(random(0,255)), int(random(0,255))),
    ];
    this.createPixels();
  }

  createPixels() {
    this.pixels = [];
    
    // Fill pixels with color indices (0, 1, or 2)
    for (let i = 0; i < (this.size) ; i++) {
      this.pixels[i] = [];
      for (let j = 0; j < this.size; j++) {
        // Introduce randomness in the color assignment
        this.pixels[i][j] = floor(random(this.colors.length));
      }
    }
  }

  display() {
    for (let i = 0; i < this.pixels.length; i++) {
      for (let j = 0; j < this.pixels[i].length; j++) {
        // Use Perlin noise to create a more organic shape
        //console.log(random(0.03,0.08).toFixed(3));
        let noiseVal = noise((this.x + j) * 0.085, (this.y + i) * 0.085);
        if (noiseVal > 0.63) {
          let xPixel = this.x + j * (this.size / 2);
          let yPixel = this.y + i * (this.size / 2);
          fill(this.colors[this.pixels[i][j]]);
          rect(xPixel, yPixel, this.size / 2, this.size / 2);
        }
      }
    }
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

  if (key == 's' || key == 'S'){
   saveCanvas('genuary4-Pixels', 'png');
   console.log('ua');
  } 

  
}