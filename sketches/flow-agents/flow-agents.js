const MAX_PARTICLE_COUNT = 100;

const colorScheme1 = ["#E69F66"];
const colorScheme2 = ["#ff2b2a"];
const colorScheme3 = ["#2276bf"];

let theShader;
let shaderTexture;

const particleList = [];
let particleGroup;

function preload() {
  theShader = loadShader("./vert.glsl", "./frag.glsl");
}

function setup() {
  pixelDensity(1);

  createCanvas(windowWidth, min(windowWidth, windowHeight), WEBGL);
  shaderTexture = createGraphics(height, height, WEBGL);
  shaderTexture.noStroke();

  const c1 = random(colorScheme1);
  const c2 = random(colorScheme2);
  const c3 = random(colorScheme3);

  for (let i = 0; i < MAX_PARTICLE_COUNT; i++) {
    const myParticle = new Particle(height / 2, height / 2, 1000, -1000, c1);
    const myParticle1 = new Particle(height / 2, height / 2, 3000, -5000, c2);
    const myParticle2 = new Particle(height / 2, height / 2, -2000, 2000, c3);
    particleList.push(myParticle, myParticle1, myParticle2);
  }

  particleGroup = new ParticleGroup();
}

function draw() {
  background(0);
  translate(-height / 2, -height / 2);
  shaderTexture.shader(theShader);

  const data = particleGroup.draw();

  theShader.setUniform("resolution", [height, height]);
  theShader.setUniform("particles", [...data.particles]);
  theShader.setUniform("particleCount", data.particles.length);
  theShader.setUniform("particleColors", [...data.particleColors]);

  shaderTexture.rect(0, 0, height, height);

  texture(shaderTexture);

  rect(0, 0, height, height);
}

function keyPressed() {
  if (keyCode === ENTER) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}
