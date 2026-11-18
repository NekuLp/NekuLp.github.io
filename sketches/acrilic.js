

// Buffers offscreen
let pgColor;  // Buffer de pigmentos y mezclas de color
let pgHeight; // Buffer de relieve físico (escala de grises: altura de pintura)

// Shader
let oilShader;


const CANVAS_W = 1080;
const CANVAS_H = 1920;

// Estado
let currentPaletteIdx = 0;
let currentStyleIdx = 0; // 0: Curved, 1: Fluid
let lightMode = 'orbit'; // 'mouse', 'studio', 'orbit'
let paintingSeed = 0;
let globalTime = 0;


const PALETTES = [
  {
    name: "Cobalto & Ocre",
    bg: [247, 243, 235],
    colors: [
      [18, 48, 95],    
      [32, 90, 160],   
      [210, 142, 38],  
      [155, 72, 28],   
      [185, 115, 35],  
      [14, 25, 48]     
    ]
  },
  {
    name: "Terracota & Carbón",
    bg: [245, 241, 233],
    colors: [
      [175, 58, 32],   
      [205, 95, 42],   
      [85, 48, 38],    
      [34, 34, 36],    
      [215, 125, 75],  
      [140, 50, 30]    
    ]
  },
  {
    name: "Bosque & Salvia",
    bg: [244, 243, 237],
    colors: [
      [20, 52, 38],    
      [58, 105, 74],   
      [118, 155, 120], 
      [202, 158, 65],  
      [75, 118, 88],   
      [28, 35, 25]     
    ]
  },
  {
    name: "Carmín & Ultramar",
    bg: [248, 244, 239],
    colors: [
      [24, 40, 115],   
      [172, 28, 55],   
      [215, 78, 92],   
      [232, 148, 38],  
      [135, 22, 60],   
      [20, 18, 38]     
    ]
  },
  {
    name: "Monocromo & Ámbar",
    bg: [246, 244, 239],
    colors: [
      [22, 22, 24],    
      [58, 62, 68],    
      [135, 140, 146], 
      [210, 152, 52],  
      [175, 120, 40],  
      [85, 88, 95]     
    ]
  },
  {
    name: "Bruma Marina",
    bg: [243, 244, 241],
    colors: [
      [28, 72, 95],    
      [68, 132, 152],  
      [135, 175, 185], 
      [188, 138, 72],  
      [42, 95, 118],   
      [20, 42, 54]     
    ]
  }
];

// Los 2 estilos activos
const STYLES = [
  { id: 'curved', name: 'Brochazos Curveados & Gestuales' },
  { id: 'fluid', name: 'Flujo Sinuoso & Lazos' }
];


const VERTEX_SHADER = `
  precision highp float;
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying vec2 vTexCoord;

  void main() {
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vTexCoord;

  uniform sampler2D u_colorMap;
  uniform sampler2D u_heightMap;
  uniform vec2 u_resolution;
  uniform vec3 u_lightDir;
  uniform float u_bumpStrength;
  uniform float u_ambient;
  uniform float u_specularStrength;

  float getPhysicalHeight(vec2 uv) {
    float hPaint = texture2D(u_heightMap, uv).r;

    // Trama de lienzo sutil solo en áreas vacías
    float clothMask = 1.0 - smoothstep(0.01, 0.05, hPaint);
    vec2 pix = uv * u_resolution;
    float warp = sin(pix.x * 0.95);
    float weft = cos(pix.y * 0.95);
    float clothRelief = (warp * weft * 0.5 + 0.5) * 0.014;

    return hPaint + clothRelief * clothMask;
  }

  // Sobel 3x3 continuo para normales suaves
  vec3 calculateNormal(vec2 uv, vec2 step) {
    float tl = getPhysicalHeight(uv + vec2(-step.x, -step.y));
    float t  = getPhysicalHeight(uv + vec2(0.0, -step.y));
    float tr = getPhysicalHeight(uv + vec2(step.x, -step.y));
    float l  = getPhysicalHeight(uv + vec2(-step.x, 0.0));
    float r  = getPhysicalHeight(uv + vec2(step.x, 0.0));
    float bl = getPhysicalHeight(uv + vec2(-step.x, step.y));
    float b  = getPhysicalHeight(uv + vec2(0.0, step.y));
    float br = getPhysicalHeight(uv + vec2(step.x, step.y));

    float dX = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
    float dY = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);

    return normalize(vec3(-dX * u_bumpStrength, -dY * u_bumpStrength, 1.0));
  }

  void main() {
    vec2 uv = vTexCoord;
    vec2 step = 1.0 / u_resolution;

    float h = getPhysicalHeight(uv);
    float hPaint = texture2D(u_heightMap, uv).r;
    vec3 normal = calculateNormal(uv, step);
    vec4 baseColor = texture2D(u_colorMap, uv);

    // Color de fondo para lienzo sin pintar (beige natural)
    vec3 canvasBeige = vec3(0.77, 0.72, 0.68); // tono beige natural del lienzo

    // Mezcla suave entre el beige y la textura del lienzo según la cantidad de pintura.
    // Usamos un rango pequeño para que apenas con cualquier trazo el color transicione a la textura.
    float canvasBlend = smoothstep(0.0, 0.52, hPaint); // 0 → solo beige, 1 → textura completa
    baseColor.rgb = mix(canvasBeige, baseColor.rgb, canvasBlend);

    // Trama de color en lienzo vacío (se mantiene sobre el color base resultante)
    vec2 pix = uv * u_resolution;
    float weaveCol = (sin(pix.x * 0.95) * cos(pix.y * 0.95)) * 0.014;
    float clothMask = 1.0 - smoothstep(0.01, 0.06, hPaint);
    // Mezclamos la trama con el color base (ya sea beige o la textura)
    baseColor.rgb += vec3(weaveCol) * clothMask;

    vec3 L = normalize(u_lightDir);
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);

    // 1. Iluminación Difusa envolvente (Half-Lambert)
    float NdotL = dot(normal, L);
    float diffuse = clamp((NdotL + 2.45) / 1.45, 0.0, 1.0);
    //float diffuse = clamp((NdotL + 0.45) / 1.45, 0.0, 1.0);

    // 2. Sombra de contacto rasante fluida
    float shadowOffset1 = 0.5;
    float shadowOffset2 = 0.5;
    float hNear = getPhysicalHeight(uv + L.xy * step * shadowOffset1);
    float hFar  = getPhysicalHeight(uv + L.xy * step * shadowOffset2);

    float shadow = 1.0;
    if (hNear > h + 0.007) {
      shadow = min(shadow, clamp(1.0 - (hNear - h) * 4.4, 0.32, 1.0));
    }
    if (hFar > h + 0.015) {
      shadow = min(shadow, clamp(1.0 - (hFar - h) * 2.8, 0.48, 1.0));
    }

    // 3. Brillo Especular Aceitoso fino
    float NdotH = max(dot(normal, H), 0.0);
    float paintGloss = smoothstep(0.03, 0.25, hPaint);

    float shininess = 32.0 + paintGloss * 36.0;
    float spec = pow(NdotH, shininess) * paintGloss * u_specularStrength;

    float NdotV = max(dot(normal, V), 0.0);
    float fresnel = pow(1.0 - NdotV, 4.0) * 0.12 * paintGloss * u_specularStrength;
    spec += fresnel;

    vec3 lightColor = vec3(1.02, 0.99, 0.95);
    vec3 ambientColor = vec3(u_ambient);

    vec3 lit = baseColor.rgb * (ambientColor + lightColor * diffuse * shadow);
    vec3 specColor = vec3(1.0, 0.98, 0.95) * spec;
    lit += specColor;

    vec2 dist = uv - 0.5;
    float vignette = 1.0 - dot(dist, dist) * 0.22;
    lit *= vignette;

    gl_FragColor = vec4(lit, 1.0);
  }
`;

function setup() {
  let displayH = min(windowHeight * 0.85, 880);
  let displayW = displayH * (CANVAS_W / CANVAS_H);

  //let canvas = createCanvas(displayW, displayH, WEBGL);
  let canvas = createCanvas(CANVAS_W, CANVAS_H, WEBGL);

  
  pixelDensity(window.devicePixelRatio ? min(window.devicePixelRatio, 2) : 1);

  pgColor = createGraphics(CANVAS_W, CANVAS_H);
  pgHeight = createGraphics(CANVAS_W, CANVAS_H);

  oilShader = createShader(VERTEX_SHADER, FRAGMENT_SHADER);

  paintingSeed = floor(random(1000000));
  generatePainting();

  setupUI();
}

// function windowResized() {
//   let displayH = min(windowHeight * 0.85, 880);
//   let displayW = displayH * (CANVAS_W / CANVAS_H);
//   resizeCanvas(displayW, displayH);
// }

function draw() {
  globalTime += 0.020;

  let lightDir = getLightDirection();

  shader(oilShader);
  oilShader.setUniform('u_colorMap', pgColor);
  oilShader.setUniform('u_heightMap', pgHeight);
  oilShader.setUniform('u_resolution', [CANVAS_W, CANVAS_H]);
  oilShader.setUniform('u_lightDir', lightDir);
  oilShader.setUniform('u_bumpStrength', 4.8);
  oilShader.setUniform('u_ambient', 0.42);
  oilShader.setUniform('u_specularStrength', 0.38);

  rect(-width / 2, -height / 2, width, height);
}

function getLightDirection() {
  if (lightMode === 'mouse' && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    let nx = (mouseX - width / 2) / (width / 2);
    let ny = (mouseY - height / 2) / (height / 2);
    return [-nx * 0.88, -ny * 0.88, 0.42];
  } else if (lightMode === 'orbit') {
    let angle = globalTime * 0.99;
    // Custom orbit: stick to left side, swing near bottom‑left corner, then sweep toward middle‑right and back.
    // Use a Lissajous‑style parametric curve to get a non‑circular path.
    let t = globalTime * 0.95;
    // X stays mostly negative (left side) with a small sinusoidal swing.
    let x = -1.9 + 1.3 * sin(t * 0.8);
    // Y moves from near the bottom (-0.9) up toward the centre and back, creating a vertical sweep.
    let y = -1.9 + 1.6 * sin(t * 1.6);
    return [x, y, 0.42];
  } else {
    return [-0.75, -0.55, 0.42];
  }
}


function generatePainting() {
  randomSeed(paintingSeed);
  noiseSeed(paintingSeed);

  let palette = PALETTES[currentPaletteIdx];
  let style = STYLES[currentStyleIdx].id;

  
  pgColor.background(palette.bg[0], palette.bg[1], palette.bg[2]);
  pgHeight.background(14);

  
  if (style === 'curved') {
    renderCurvedStrokesStyle(palette);
  } else if (style === 'fluid') {
    renderFluidLoopsStyle(palette);
  }

  // 3. SECCIÓN MODIFICABLE: Trazos / garabatos / acentos superpuestos
  renderGarabatosAccents(palette);

  // document.getElementById('palette-name').textContent = palette.name;
  // document.getElementById('style-name').textContent = STYLES[currentStyleIdx].name;
}


function renderCurvedStrokesStyle(palette) {
  //let numStrokes = floor(random(2, 6));
  let numStrokes = floor(random(6, 9));

  // Tipos gestuales variados para que nunca sean todos iguales (cero pretzels repetitivos)
  let gestureTypes = ['center-slash', 'wide-arc', 'whip-hook', 'wandering-free', 'focal-thrust'];

  for (let i = 0; i < numStrokes; i++) {
    // Escoger un tipo de gesto diferente y aleatorio para cada brochazo
    let gesture = (i === 0 || i === 1) ? 'center-slash' : random(gestureTypes);
    console.log(gesture);
    let spine = createUnpredictableSpine(i, numStrokes, gesture);

    let c1 = palette.colors[i % palette.colors.length];
    let c2 = palette.colors[(i + 1) % palette.colors.length];

    // Variedad de anchos de brocha: desde trazos ágiles hasta brochas monumentales
    let brushWidth = random([65, 80, 95, 115, 130]);
    let baseHeight = random(190, 248);

    drawWetBlendedBrushstroke(spine, brushWidth, c1, c2, baseHeight);
  }
}

function renderFluidLoopsStyle(palette) {
  let numStrokes = floor(random(5, 7));

  for (let i = 0; i < numStrokes; i++) {
    let spine = createUnpredictableSpine(i, numStrokes, 'fluid-loop');

    let c1 = palette.colors[i % palette.colors.length];
    let c2 = palette.colors[(i + 2) % palette.colors.length];

    let brushWidth = random(65, 105);
    let baseHeight = random(185, 240);

    drawWetBlendedBrushstroke(spine, brushWidth, c1, c2, baseHeight);
  }
}


function renderGarabatosAccents(palette) {
  // CANTIDAD DE GARABATOS 
  let numGarabatos = floor(random(2, 4));

  for (let i = 0; i < numGarabatos; i++) {
    
    let colorG = [random(0, 100), random(0, 100), random(0, 100)];


    let cx = random(CANVAS_W * 0.25, CANVAS_W * 0.75);
    let cy = random(CANVAS_H * 0.25, CANVAS_H * 0.75);


    let radio = random(250, 660) + random(-40, 40);        // Radio de giro (más chico = más como bola)
    let vueltas = random(0.1, 0.8);   // Cuántas vueltas da sobre sí mismo (más vueltas = más ovillo/garabato)
    let baseAng = random(TWO_PI);

    
    let controlPoints = [];
    let numPuntos =  floor(random(4, 8));
    for (let p = 0; p < numPuntos; p++) {
      let t = p / (numPuntos - 1);
      let angulo = baseAng + t * vueltas * TWO_PI;
      let r = radio * (0.5 - t * random(0.2, 1.6));
      let px = cx + cos(angulo) * r;
      let py = cy + sin(angulo) * r;
      controlPoints.push(createVector(px, py));
    }

    let spine = generateSpline(controlPoints, 45);

    
    let grosorBrocha = random(35, 55); // Ancho del trazo de este garabato
    let alturaRelieve = 240;           // Altura física (10 a 255)

    drawWetBlendedBrushstroke(spine, grosorBrocha, colorG, colorG, alturaRelieve);
  }
}


function createUnpredictableSpine(index, total, gesture) {
  let controlPoints = [];

  // Puntos clave del canvas
  let centerX = CANVAS_W * 0.5 + random(-80, 80);
  let centerY = CANVAS_H * 0.5 + random(-80, 80);

  if (gesture === 'center-slash') {
    // 1. GRAN TAJO QUE CRUZA VIGOROSAMENTE POR EL CENTRO DEL CANVAS
    let angle = random(TWO_PI);
    let len = random(720, 960);

    // El trazo empieza de un lado, cruza por el centro, y sale por el otro lado
    let pStart = createVector(centerX - cos(angle) * (len * 0.5), centerY - sin(angle) * (len * 0.5));
    let pEnd   = createVector(centerX + cos(angle) * (len * 0.5), centerY + sin(angle) * (len * 0.5));

    // Desviación orgánica asimétrica del brazo
    let perp = createVector(-sin(angle), cos(angle)).mult(random(-140, 140));
    let pMid1 = pStart.copy().lerp(pEnd, 0.35).add(perp);
    let pMid2 = pStart.copy().lerp(pEnd, 0.70).add(perp.copy().mult(random(-0.5, 0.5)));

    controlPoints = [pStart, pMid1, pMid2, pEnd];

  } else if (gesture === 'wide-arc') {
    // 2. ARCO ENVOLVENTE AMPLIO (Abraza el centro o un costado con curvatura asimétrica)
    let p0 = createVector(random(CANVAS_W * 0.15, CANVAS_W * 0.85), random(CANVAS_H * 0.15, CANVAS_H * 0.85));
    let radius = random(260, 480);
    let startAng = random(TWO_PI);
    let arcSweep = radius = random(260, 480) + random(-80, 80); // Arco amplio continuo
    let steps = 4;

    for (let s = 0; s <= steps; s++) {
      let t = s / steps;
      let a = startAng + arcSweep * t;
      let r = radius * (1.2 - t * random(0.25,0.45)) + random(-50,50);
      let px = p0.x + cos(a) * r;
      let py = p0.y + sin(a) * r * 0.9;
      controlPoints.push(createVector(px, py));
    }

  } else if (gesture === 'whip-hook') {
    // 3. QUIEBRE / LATIGAZO (Trazo rápido que quiebra de dirección con energía)
    let startX = random(CANVAS_W * 0.2, CANVAS_W * 0.8);
    let startY = random(CANVAS_H * 0.2, CANVAS_H * 0.8);
    let p0 = createVector(startX, startY);

    let ang1 = random(TWO_PI);
    let len1 = random(320, 520);
    let p1 = p0.copy().add(cos(ang1) * (len1 * 0.5), sin(ang1) * (len1 * 0.5));
    let pPivot = p0.copy().add(cos(ang1) * len1, sin(ang1) * len1);

    // Quiebre vigoroso de muñeca (cambio de dirección de 60 a 130 grados)
    let turn = random() < 0.5 ? random(1.1, 2.2) : random(-2.2, -1.1);
    let ang2 = ang1 + turn;
    let len2 = random(260, 460);
    let pEnd = pPivot.copy().add(cos(ang2) * len2, sin(ang2) * len2);

    controlPoints = [p0, p1, pPivot, pEnd];

  } else if (gesture === 'wandering-free') {
    // 4. SERPENTEO LIBRE IMPREDECIBLE (4 a 6 pasos orgánicos)
    let curr = createVector(random(CANVAS_W * 0.2, CANVAS_W * 0.8), random(CANVAS_H * 0.2, CANVAS_H * 0.8));
    controlPoints.push(curr.copy());

    let currAngle = random(TWO_PI);
    let numSteps = floor(random(4, 6));

    for (let s = 0; s < numSteps; s++) {
      let stepLen = random(110, 190);
      // Giros asimétricos no uniformes
      currAngle += random(-0.9, 0.9);

      // Si se aleja mucho del centro, lo orienta sutilmente hacia el canvas interior
      let toCenter = createVector(centerX - curr.x, centerY - curr.y).heading();
      currAngle = lerp(currAngle, toCenter, 0.25);

      curr = curr.copy().add(cos(currAngle) * stepLen, sin(currAngle) * stepLen);
      controlPoints.push(curr.copy());
    }

  } else if (gesture === 'focal-thrust') {
    // 5. GOLPE / CORTE CONCENTRADO DIRECTO EN EL NÚCLEO CENTRAL
    let ang = random(TWO_PI);
    let len = random(340, 540);
    let p0 = createVector(centerX - cos(ang) * (len * 0.5) + random(-50, 50), centerY - sin(ang) * (len * 0.5) + random(-50, 50));
    let pMid = createVector(centerX + random(-40, 40), centerY + random(-40, 40));
    let pEnd = createVector(centerX + cos(ang) * (len * 0.5) + random(-50, 50), centerY + sin(ang) * (len * 0.5) + random(-50, 50));

    controlPoints = [p0, pMid, pEnd];

  } else {
    // fluid-loop: lazo sinuoso orgánico
    let baseAngle = random(TWO_PI);
    let p0 = createVector(random(CANVAS_W * 0.2, CANVAS_W * 0.8), random(CANVAS_H * 0.2, CANVAS_H * 0.8));
    let strokeLength = random(550, 800);
    let p1 = p0.copy().add(cos(baseAngle) * (strokeLength * 0.35), sin(baseAngle) * (strokeLength * 0.35));
    let p2 = p1.copy().add(cos(baseAngle + 0.85) * (strokeLength * 0.40), sin(baseAngle + 0.85) * (strokeLength * 0.40));
    let p3 = p2.copy().add(cos(baseAngle + 1.6) * (strokeLength * 0.38), sin(baseAngle + 1.6) * (strokeLength * 0.38));

    controlPoints = [p0, p1, p2, p3];
  }

  return generateSpline(controlPoints, 95);
}

/**
 * SIMULACIÓN DE BROCHAZO LÍQUIDO CON MEZCLA HÚMEDA (WET-ON-WET)
 * Y COMPORTAMIENTO ORGÁNICO ASIMÉTRICO EN EXTREMOS Y GIROS
 */
function drawWetBlendedBrushstroke(spine, brushWidth, col1, col2, baseHeight) {
  let totalPts = spine.length;
  if (totalPts < 3) return;

  let strokeSeed = random(100000);

  // Configurar remates planos sin círculos rígidos
  pgColor.strokeCap(SQUARE);
  pgHeight.strokeCap(SQUARE);

  // 1. Precalcular tangentes y normales continuas
  let tangents = [];
  let normals = [];
  for (let i = 0; i < totalPts; i++) {
    let prev = spine[max(0, i - 1)];
    let next = spine[min(totalPts - 1, i + 1)];
    let tVec = p5.Vector.sub(next, prev);
    if (tVec.magSq() < 0.0001) tVec = createVector(1, 0);
    tVec.normalize();
    tangents.push(tVec);

    let nVec = createVector(-tVec.y, tVec.x);
    normals.push(nVec);
  }

  // 2. Precalcular curvatura / intensidad de giro ('revuelto') a lo largo de la espina
  let rawCurv = new Float32Array(totalPts);
  for (let i = 1; i < totalPts - 1; i++) {
    let tPrev = tangents[i - 1];
    let tNext = tangents[i + 1];
    let cross = tPrev.x * tNext.y - tPrev.y * tNext.x;
    let dot = constrain(tPrev.x * tNext.x + tPrev.y * tNext.y, -1.0, 1.0);
    rawCurv[i] = abs(atan2(cross, dot));
  }
  rawCurv[0] = rawCurv[1];
  rawCurv[totalPts - 1] = rawCurv[totalPts - 2];

  // Suavizado continuo de curvatura (filtro de caja 5 puntos)
  let turnIntensities = new Float32Array(totalPts);
  for (let i = 0; i < totalPts; i++) {
    let sum = 0, count = 0;
    for (let k = -2; k <= 2; k++) {
      let idx = constrain(i + k, 0, totalPts - 1);
      sum += rawCurv[idx];
      count++;
    }
    // Giro normalizado: un cambio angular sensible satura suavemente a 1.0
    turnIntensities[i] = constrain((sum / count) * 8.5, 0.0, 1.0);
  }

  // 3. Parámetros de asimetría orgánica para los extremos (Entrada y Salida angulada)
  let startSlant = random(-0.15, 0.15);
  let endSlant = random(-0.16, 0.16);

  // 4. Parámetros de cerdas individuales (Orgánicas, fluidas y continuas)
  let numBristles = random(18,38);
  let bristleSpacing = brushWidth / numBristles;

  let bristleStarts = [];
  let bristleEnds = [];

  for (let b = 0; b < numBristles; b++) {
    let u = map(b, 0, numBristles - 1, -0.48, 0.48);

    // Entrada orgánica asimétrica
    let startLinear = u * startSlant;
    let startNoise = (noise(strokeSeed + 12.0, (u + 0.5) * 4.0) - 0.5) * 0.07;
    let sT = constrain(0.04 + startLinear + startNoise, 0.01, 0.22);
    bristleStarts.push(sT);

    // Salida orgánica asimétrica: las cerdas se desvanecen suavemente dentro del líquido
    let endLinear = u * endSlant;
    let endNoise = (noise(strokeSeed + 88.0, (u + 0.5) * 4.0) - 0.5) * 0.08;
    let eT = constrain(0.96 - endLinear + endNoise, 0.78, 0.99);

    if (eT <= sT + 0.22) eT = min(1.0, sT + 0.22);
    bristleEnds.push(eT);
  }

  // Tono de mezcla húmeda ("wet-stirred" en zonas de giro)
  let midColor = [
    (col1[0] + col2[0]) * 0.5,
    (col1[1] + col2[1]) * 0.5,
    (col1[2] + col2[2]) * 0.5
  ];

  // =========================================================================
  // FASE 1: MASA BASE CONTINUA DE FLUIDO LÍQUIDO
  // =========================================================================
  let fluidRibbons = 36; // Más cintas finas para flujo más suave
  for (let r = 0; r < fluidRibbons; r++) {
    let u = map(r, 0, fluidRibbons - 1, -0.46, 0.46);
    let mixFactor = map(u, -0.46, 0.46, 0, 1);

    let ribbonWidth = (brushWidth / fluidRibbons) * 2.8;
    let meniscus = sqrt(max(0.12, 1.0 - pow(u / 0.5, 2.0)));

    // La base líquida envuelve de forma fluida el trazo
    let rStartT = constrain(0.02 + u * startSlant + (noise(strokeSeed + 5.0, (u + 0.5) * 3.0) - 0.5) * 0.04, 0.0, 0.16);
    let rEndT   = constrain(0.98 - u * endSlant   + (noise(strokeSeed + 95.0, (u + 0.5) * 3.0) - 0.5) * 0.05, 0.82, 1.0);
    if (rEndT <= rStartT + 0.25) rEndT = min(1.0, rStartT + 0.25);

    let prevPt = null;

    for (let i = 0; i < totalPts; i++) {
      let t = i / (totalPts - 1);
      if (t < rStartT || t > rEndT) {
        prevPt = null;
        continue;
      }

      let fadeIn = smoothstep(rStartT, rStartT + 0.12, t);
      let fadeOut = smoothstep(rEndT, rEndT - 0.14, t);
      let envelope = fadeIn * fadeOut;
      if (envelope < 0.002) {
        prevPt = null;
        continue;
      }

      let turn = turnIntensities[i];

      // Desplazamiento fluido en giros: la masa de pintura se deforma con el vórtice
      let swirlN = (noise(strokeSeed + 20.0 + t * 3.8, (u + 0.5) * 2.8) - 0.5) * 2.0 * turn * brushWidth * 0.26;
      let lagT   = (noise(strokeSeed + 60.0 + t * 2.5, (u + 0.5) * 2.2) - 0.5) * 2.0 * turn * brushWidth * 0.15;

      let currentWidth = brushWidth * (0.90 + 0.12 * envelope);
      let offset = normals[i].copy().mult(u * currentWidth + swirlN).add(tangents[i].copy().mult(lagT));
      let pt = p5.Vector.add(spine[i], offset);

      // Mezcla de color líquido: en giros la pintura se revuelve
      let colorDrift = (noise(strokeSeed + 150.0 + t * 3.5, u * 2.0) - 0.5) * turn * 0.65;
      let effectiveMix = constrain(mixFactor + colorDrift, 0.0, 1.0);

      let cr = lerp(col1[0], col2[0], effectiveMix);
      let cg = lerp(col1[1], col2[1], effectiveMix);
      let cb = lerp(col1[2], col2[2], effectiveMix);

      if (turn > 0.15) {
        let stirAmt = turn * 0.40;
        cr = lerp(cr, midColor[0], stirAmt);
        cg = lerp(cg, midColor[1], stirAmt);
        cb = lerp(cb, midColor[2], stirAmt);
      }

      if (prevPt) {
        // Adelgazamiento fluido: el grosor se afina en punta hacia los extremos, eliminando círculos
        let fluidWeight = ribbonWidth * constrain(pow(envelope, 0.65), 0.05, 1.0);

        pgColor.stroke(cr, cg, cb, 235 * envelope);
        pgColor.strokeWeight(fluidWeight);
        pgColor.line(prevPt.x, prevPt.y, pt.x, pt.y);

        // En giros la pintura se apila y forma un colchón homogéneo más grueso
        let turnPile = 1.0 + turn * 0.22;
        let hVal = baseHeight * 0.75 * meniscus * turnPile * envelope;
        pgHeight.stroke(constrain(hVal, 14, 255));
        pgHeight.strokeWeight(fluidWeight);
        pgHeight.line(prevPt.x, prevPt.y, pt.x, pt.y);
      }

      prevPt = pt;
    }
  }

  // =========================================================================
  // FASE 2: ESTRÍAS Y CERDAS FLUIDAS EN LA SUPERFICIE CON MEZCLA VÓRTICE
  // Embebidas suavemente dentro de la masa líquida y con afinamiento en punta
  // =========================================================================
  for (let b = 0; b < numBristles; b++) {
    let u = map(b, 0, numBristles - 1, -0.48, 0.48);
    let mixFactor = map(u, -0.48, 0.48, 0, 1);

    let meniscus = sqrt(max(0.14, 1.0 - pow(u / 0.5, 2.0)));
    let startT = bristleStarts[b];
    let endT = bristleEnds[b];

    let bristleTint = sin(b * 1.5 + strokeSeed) * 7;

    let prevPt = null;

    for (let i = 0; i < totalPts; i++) {
      let t = i / (totalPts - 1);
      if (t < startT || t > endT) {
        prevPt = null;
        continue;
      }

      let fadeIn = smoothstep(startT, startT + 0.12, t);
      let fadeOut = smoothstep(endT, endT - 0.16, t);
      let envelope = fadeIn * fadeOut;
      if (envelope < 0.01) {
        prevPt = null;
        continue;
      }

      let turn = turnIntensities[i];

      // Desplazamiento orgánico no simétrico en curvas:
      // Las cerdas se arremolinan y se desvían de sus rieles fijos
      let swirlVal = (noise(strokeSeed + 45.0 + t * 4.2, (u + 0.5) * 3.4) - 0.5) * 2.0 * turn * brushWidth * 0.38;
      let lagVal   = (noise(strokeSeed + 110.0 + t * 3.0, (u + 0.5) * 2.8) - 0.5) * 2.0 * turn * brushWidth * 0.22;

      let currentWidth = brushWidth * (0.90 + 0.10 * envelope);
      let offset = normals[i].copy().mult(u * currentWidth + swirlVal).add(tangents[i].copy().mult(lagVal));
      let pt = p5.Vector.add(spine[i], offset);

      // Mezcla cromática húmeda en curvas:
      // El pigmento gira y se entreteje en vez de permanecer en líneas paralelas
      let swirlColor = (noise(strokeSeed + 220.0 + t * 4.5, (u + 0.5) * 3.0) - 0.5) * turn * 0.88;
      let effectiveMix = constrain(mixFactor + swirlColor, 0.0, 1.0);

      let cr = lerp(col1[0], col2[0], effectiveMix) + bristleTint;
      let cg = lerp(col1[1], col2[1], effectiveMix) + bristleTint;
      let cb = lerp(col1[2], col2[2], effectiveMix) + bristleTint;

      if (turn > 0.12) {
        // Vetas de mezcla líquida que simulan óleo/acrílico mezclado al girar la brocha
        let stirFactor = turn * 0.48 * (0.5 + 0.5 * noise(strokeSeed + 340.0 + t * 5.0, b * 0.35));
        cr = lerp(cr, midColor[0], stirFactor);
        cg = lerp(cg, midColor[1], stirFactor);
        cb = lerp(cb, midColor[2], stirFactor);
      }

      cr = constrain(cr, 0, 255);
      cg = constrain(cg, 0, 255);
      cb = constrain(cb, 0, 255);

      if (prevPt) {
        // El grosor de la cerda se afina proporcionalmente a la salida, eliminando círculos visibles
        let bristleWeight = (bristleSpacing * 2.1) * constrain(pow(envelope, 0.65), 0.05, 1.0);

        pgColor.stroke(cr, cg, cb, 245 * envelope);
        pgColor.strokeWeight(bristleWeight);
        pgColor.line(prevPt.x, prevPt.y, pt.x, pt.y);

        // Relieve: en zonas de giro la pintura se alisa y empasta
        let rawGroove = 0.90 + 0.12 * sin(b * 1.4);
        let fluidSmoothGroove = lerp(rawGroove, 1.0, turn * 0.88);
        let turnBank = 1.0 + turn * 0.22;

        let hVal = baseHeight * meniscus * fluidSmoothGroove * turnBank * envelope;
        hVal = constrain(hVal, 14, 255);

        pgHeight.stroke(hVal);
        pgHeight.strokeWeight(bristleWeight);
        pgHeight.line(prevPt.x, prevPt.y, pt.x, pt.y);
      }

     

      prevPt = pt;


    }

     // Remate de estiramiento líquido: la cerda se estira hacia adelante en la dirección T del trazo
    if (prevPt) {
      console.log('ea');
      let lastT = tangents[totalPts - 1];
      let lastN = normals[totalPts - 1];

      // Cada cerda se estira con una longitud orgánica distinta (efecto fluido viscoso arrastrado)
      let stretchLength = random(brushWidth * 0.25, brushWidth * 0.75);
      let steps = 10;
      let pCurrent = prevPt.copy();

      for (let s = 1; s <= steps; s++) {
        let f = s / steps;
        let fade = (1.0  - f) * (1.0 - f);

        // Adelgazamiento progresivo en punta líquida:
        // aqui se ve qwue se meven bastantes madres CHECAR
        let w = max(0.4, (bristleSpacing * 0.1) * fade);

        // Avanza en dirección del trazo (lastT) con curvatura orgánica por inercia
        let forward = lastT.copy().mult(f * stretchLength);
        let curl = lastN.copy().mult(sin(f * PI) * (noise(strokeSeed + b * 11.0, f * 2.0) - 0.5) * brushWidth * 0.16);
        let pNext = prevPt.copy().add(forward).add(curl);

        pgColor.stroke(cr, cg, cb, 235 * fade);
        pgColor.strokeWeight(w);
        pgColor.line(pCurrent.x, pCurrent.y, pNext.x, pNext.y);

        let hVal = baseHeight * meniscus * 0.55 * fade;
        pgHeight.stroke(constrain(hVal, 14, 255));
        pgHeight.strokeWeight(w);
        pgHeight.line(pCurrent.x, pCurrent.y, pNext.x, pNext.y);

        pCurrent = pNext;
      }
    }

    
  }

  // =========================================================================
  // FASE 3: CRESTA DE MENISCO LÍQUIDO LATERAL CON COLOR Y RELIEVE ACOPLADOS
  // =========================================================================
  let edgeConfigs = [
    { u: -0.46, col: col1 },
    { u:  0.46, col: col2 }
  ];

  for (let edge of edgeConfigs) {
    let edgeStartT = constrain(0.05 + edge.u * startSlant, 0.03, 0.24);
    let edgeEndT   = constrain(0.95 - edge.u * endSlant,   0.72, 0.97);
    if (edgeEndT <= edgeStartT + 0.20) edgeEndT = min(0.98, edgeStartT + 0.20);

    let prevPt = null;
    for (let i = 0; i < totalPts; i++) {
      let t = i / (totalPts - 1);
      if (t < edgeStartT || t > edgeEndT) {
        prevPt = null;
        continue;
      }

      let fadeIn = smoothstep(edgeStartT, edgeStartT + 0.12, t);
      let fadeOut = smoothstep(edgeEndT, edgeEndT - 0.15, t);
      let envelope = fadeIn * fadeOut;
      if (envelope < 0.02) {
        prevPt = null;
        continue;
      }

      let turn = turnIntensities[i];
      let swirlVal = (noise(strokeSeed + 45.0 + t * 4.2, (edge.u + 0.5) * 3.4) - 0.5) * 2.0 * turn * brushWidth * 0.32;
      let lagVal   = (noise(strokeSeed + 110.0 + t * 3.0, (edge.u + 0.5) * 2.8) - 0.5) * 2.0 * turn * brushWidth * 0.18;

      let currentWidth = brushWidth * (0.90 + 0.10 * envelope);
      let offset = normals[i].copy().mult(edge.u * currentWidth + swirlVal).add(tangents[i].copy().mult(lagVal));
      let pt = p5.Vector.add(spine[i], offset);

      if (prevPt) {
        let edgeWeight = max(0.8, (brushWidth * 0.035) * constrain(pow(envelope, 0.65), 0.05, 1.0));

        // PINTAR COLOR Y RELIEVE JUNTOS para que nunca haya sombra sin color
        pgColor.stroke(edge.col[0], edge.col[1], edge.col[2], 230 * envelope);
        pgColor.strokeWeight(edgeWeight);
        pgColor.line(prevPt.x, prevPt.y, pt.x, pt.y);

        let ridgeH = min(255, baseHeight * 1.04 * envelope);
        pgHeight.stroke(constrain(ridgeH, 14, 255));
        pgHeight.strokeWeight(edgeWeight);
        pgHeight.line(prevPt.x, prevPt.y, pt.x, pt.y);
      }
      prevPt = pt;
    }
  }

  // =========================================================================
  // FASE 4: EFECTO DE STRETCH / LÍQUIDO ARRASTRADO (Wisps y Filamentos Gestuales)
  // Simula el acrílico/óleo viscoso que se estira longitudinalmente al despegar
  // =========================================================================
  let numStretchTrails = 16;
  let exitIdx = totalPts - 1;
  let exitPt = spine[exitIdx];
  let exitTangent = tangents[exitIdx];
  let exitNormal = normals[exitIdx];

  for (let s = 0; s < numStretchTrails; s++) {
    let u = map(s, 0, numStretchTrails - 1, -0.42, 0.42);
    let mixFactor = map(u, -0.42, 0.42, 0, 1);

    // Longitud de estiramiento orgánico arrastrado
    let dragLen = random(brushWidth * 0.35, brushWidth * 0.90);
    let trailSteps = 12;

    let cr = lerp(col1[0], col2[0], mixFactor);
    let cg = lerp(col1[1], col2[1], mixFactor);
    let cb = lerp(col1[2], col2[2], mixFactor);

    // Punto de salida de este filamento arrastrado
    let startPos = exitPt.copy().add(exitNormal.copy().mult(u * brushWidth * 0.85));
    let prevTrailPt = startPos;

    for (let step = 1; step <= trailSteps; step++) {
      let f = step / trailSteps;
      let fade = pow(1.0 - f, 1.8); // Se afina y desvanece suavemente hacia la punta

      // Desviación orgánica con la inercia del movimiento
      let forwardDist = f * dragLen;
      let curl = (noise(strokeSeed + 300.0 + s * 10.0, f * 2.5) - 0.5) * brushWidth * 0.22 * f;

      let trailPt = startPos.copy()
        .add(exitTangent.copy().mult(forwardDist))
        .add(exitNormal.copy().mult(curl));

      let w = max(0.5, (brushWidth * 0.038) * fade * 2.0);

      pgColor.stroke(cr, cg, cb, 230 * fade);
      pgColor.strokeWeight(w);
      pgColor.line(prevTrailPt.x, prevTrailPt.y, trailPt.x, trailPt.y);

      let hVal = baseHeight * 0.55 * fade;
      pgHeight.stroke(constrain(hVal, 14, 255));
      pgHeight.strokeWeight(w);
      pgHeight.line(prevTrailPt.x, prevTrailPt.y, trailPt.x, trailPt.y);

      prevTrailPt = trailPt;
    }
  }
}

/**
 * Función de interpolación suave (Smoothstep cúbico)
 */
function smoothstep(edge0, edge1, x) {
  let t = constrain((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

/**
 * Interpolación suave Spline (Catmull-Rom) sin oscilaciones angulares
 */
function generateSpline(controlPoints, numSteps) {
  let pts = [];
  if (controlPoints.length === 2) {
    for (let i = 0; i <= numSteps; i++) {
      let t = i / numSteps;
      pts.push(p5.Vector.lerp(controlPoints[0], controlPoints[1], t));
    }
    return pts;
  }

  for (let i = 0; i <= numSteps; i++) {
    let t = i / numSteps;
    let totalSegs = controlPoints.length - 1;
    let seg = constrain(floor(t * totalSegs), 0, totalSegs - 1);
    let localT = (t * totalSegs) - seg;

    let p0 = controlPoints[max(0, seg - 1)];
    let p1 = controlPoints[seg];
    let p2 = controlPoints[min(controlPoints.length - 1, seg + 1)];
    let p3 = controlPoints[min(controlPoints.length - 1, seg + 2)];

    let x = curvePoint(p0.x, p1.x, p2.x, p3.x, localT);
    let y = curvePoint(p0.y, p1.y, p2.y, p3.y, localT);

    pts.push(createVector(x, y));
  }

  return pts;
}

function keyPressed() {
  if (key === ' ' || keyCode === 32) {
    paintingSeed = floor(random(1000000));
    generatePainting();
    return false;
  } else if (key === 'p' || key === 'P') {
    currentPaletteIdx = (currentPaletteIdx + 1) % PALETTES.length;
    generatePainting();
  } else if (key === 'c' || key === 'C') {
    currentStyleIdx = (currentStyleIdx + 1) % STYLES.length;
    generatePainting();
  } else if (key === 'l' || key === 'L') {
    toggleLightMode();
  } else if (key === 's' || key === 'S') {
    saveArtwork();
  }
}

function toggleLightMode() {
  if (lightMode === 'mouse') {
    lightMode = 'studio';
  } else if (lightMode === 'studio') {
    lightMode = 'orbit';
  } else {
    lightMode = 'mouse';
  }

  let text = lightMode === 'mouse' ? 'Mouse' : (lightMode === 'studio' ? 'Estudio' : 'Órbita');
  document.getElementById('light-mode-text').textContent = text;
}

function saveArtwork() {
  let timestamp = year() + nf(month(), 2) + nf(day(), 2) + '_' + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
  saveCanvas('acrilico_empaste_' + timestamp, 'png');
}

function setupUI() {
  let btnNew = document.getElementById('btn-new');
  let btnPalette = document.getElementById('btn-palette');
  let btnStyle = document.getElementById('btn-style');
  let btnLight = document.getElementById('btn-light');
  let btnSave = document.getElementById('btn-save');

  if (btnNew) {
    btnNew.addEventListener('click', () => {
      paintingSeed = floor(random(1000000));
      generatePainting();
    });
  }

  if (btnPalette) {
    btnPalette.addEventListener('click', () => {
      currentPaletteIdx = (currentPaletteIdx + 1) % PALETTES.length;
      generatePainting();
    });
  }

  if (btnStyle) {
    btnStyle.addEventListener('click', () => {
      currentStyleIdx = (currentStyleIdx + 1) % STYLES.length;
      generatePainting();
    });
  }

  if (btnLight) {
    btnLight.addEventListener('click', toggleLightMode);
  }

  if (btnSave) {
    btnSave.addEventListener('click', saveArtwork);
  }
}
