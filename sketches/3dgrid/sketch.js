let gridSize = 100;
let rows, cols;
let pattern = [];
let patterncolor = [];

function preload() {
  glowShader = loadShader('./glow.vert', './glow.frag');
}

function setup() {
  createCanvas(800, 800, WEBGL);
  gridSize = windowWidth/18;
  
  // Initialize projection and model-view matrices
  projectionMatrix = new p5.Matrix();
  modelViewMatrix = new p5.Matrix();
  
  initSketch();
}

function initSketch() {
  // Calculate the number of rows and columns based on canvas size
  rows = int(random(3,10));
  cols = int(random(3,10));
  
  console.log(rows);
  
  // Generate a random pattern
  generatePattern();
}


function draw() {
  shader(glowShader);
  glowShader.setUniform('u_resolution', [width, height]);
  glowShader.setUniform('u_time', millis() / 1000.0);
  glowShader.setUniform('u_gridSize', gridSize);
  glowShader.setUniform('u_projectionMatrix', projectionMatrix.mat4);
  glowShader.setUniform('u_modelViewMatrix', modelViewMatrix.mat4);

  background(20);
  //drag to move the world.
  orbitControl(8);
  smooth();
  seno = (sin(radians(frameCount)) * 0.07);

  rotateX(seno);
  rotateY(-seno);

  ambientLight(140);

  // Center the pattern
  translate(-gridSize * (rows - 1) / 2, -gridSize * (cols - 1) / 2);

  let locX = mouseX - width / 2;
  let locY = mouseY - height / 2;
  pointLight(255, 255, 255, locX, locY, 50);
  
  // Draw the pattern of glowing boxes
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      if (pattern[x][y] === 1) {
        push();
          translate(x * gridSize, y * gridSize, 0);
          specularMaterial(patterncolor[x][y]);
          //emissiveMaterial(patterncolor[x][y]);
          shininess(10);
          fill(patterncolor[x][y]);
          box(gridSize, gridSize, 10, 1);
        pop();
      }
    }
  }
  resetShader();
}


function generatePattern() {
  pattern = [];
  patterncolor = [];
  for (let x = 0; x < rows; x++) {
    pattern[x] = [];
    patterncolor[x] = [];
    for (let y = 0; y < cols; y++) {
      let ccolor = color(int(random(20,255)),int(random(20,255)),int(random(20,255)))
      //console.log(ccolor);
      ccolor.setAlpha(150)
      // Randomly choose whether to fill the box (1) or leave it empty (0)
      pattern[x][y] = random() > 0.5 ? 1 : 0;
      patterncolor[x][y] = ccolor;
    }
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    initSketch();
  }
}
