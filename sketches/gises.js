let agents = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  initSketch();
}

function initSketch() {
  background('#3f1201');
  agents = [];
}

function draw() {
  translate(width / 6, height / 6);
  for (let agent of agents) {
    if (agent.active) {
      agent.update();
      agent.display();
    }
  }
}

class Agent {
  constructor() {
    this.x = random(0, width);
    this.y = random(0, height);
    this.color = color(random(100, 200), random(100, 200), random(100, 200)); // Pastel colors
    this.numDoodles = int(random(3, 7));
    this.doodleLength = 5;
    this.speed = random(5, 10);
    this.angle = random(TWO_PI);
    this.angleChange = random(PI / 8, PI / 3);
    this.active = true;
    this.drawingLimit = random(1000, 3000);
    this.startTime = millis();
    this.fadeAlpha = 255; // Initial alpha for fading
  }

  update() {
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;

    this.x = constrain(this.x, 0, width/1.5);
    this.y = constrain(this.y, 0, height/1.5);

    this.angle += random(-this.angleChange, this.angleChange);

    if (millis() - this.startTime >= this.drawingLimit) {
      this.active = false;
    }
  }

  display() {
    stroke(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.fadeAlpha);
    strokeWeight(2);

    for (let i = 0; i < this.numDoodles; i++) {
      beginShape();
      for (let j = 0; j < this.doodleLength; j++) {
        let px = this.x + random(-5, 5);
        let py = this.y + random(-5, 5);
        point(px, py);
      }
      endShape();
    }

    if (!this.active && this.fadeAlpha > 0) {
      this.fadeAlpha -= 1;
    }
  }
}

function mousePressed() {
  agents.push(new Agent());
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    initSketch();
    loop();
  }

  if (key === 'c' || key === 'C') {
    initSketch();
  }

  if (keyCode === LEFT_ARROW) {
    noLoop();
  } else if (keyCode === RIGHT_ARROW) {
    loop();
  }

  if (key == 's' || key == 'S') saveCanvas('emsjaenvis', 'png');    
}

