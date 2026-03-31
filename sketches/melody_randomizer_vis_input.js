

let melody = [];
let startTime;
let dur = 16000; // 6 seconds
let audioContextStarted = false;
let delay, reverb, eq;
let eqBandIndex = 0;
let eqBandNames = ['lows', 'mids', 'highs'];

var seed;
let xoff = 0.0;

let centroidplot = 0.0;
  let spectralCentroid = 0;
  let wave;
  let spec;
  //let bassenergy; 
  let lowmidEnergy; 
  let midEnergy;   
  //let highmidEnergy;   
  //let trebleEnergy;   
  let easing = 0.05;
  let cnv;
  let prevFrameImg;
  let  n;
  let spectrum;
  let size;
  let ccolor, ccolor2;
  
 

function setup() {
  seed = int(random(0,100000));
  cnv = createCanvas(windowWidth,500, WEBGL);  
  cnv.mousePressed(userStartAudio);
  frameRate(60);
  noiseSeed(seed);
  angleMode(DEGREES)
  //createCanvas(400, 400);
  
  colorMode(HSB, 255);
  background(0);

  // Create a "Start Audio" button
  let startAudioButton = createButton('Start Audio');
  startAudioButton.position(width / 2, height / 2);
  startAudioButton.mousePressed(startAudio);

  sound = new p5.AudioIn();
  sound.start();
  fft = new p5.FFT();
  sound.connect(fft);  

  
  wave = fft.waveform();
  spec = fft.analyze();
  
}

function startAudio() {
  if (!audioContextStarted) {
    userStartAudio().then(function () {
      audioContextStarted = true;      
      removeElements(); 
    }).catch(function (error) {
      console.error('Error starting audio context:', error);
    });
  }
}


function draw() {  
  xoff = xoff + .04;

  bassenergy = fft.getEnergy('bass')
  lowmidEnergy = fft.getEnergy('lowMid');
  midEnergy = fft.getEnergy('mid');
  //highmidEnergy = fft.getEnergy('highMid')
  //trebleEnergy = fft.getEnergy('treble')      
  
      //xoff = 0.0;
      
      n = noise(xoff) * (255);    
      //console.log('bass:'+bassenergy);
      //console.log('lowMid:'+lowmidEnergy)
      //console.log('Mids:'+midEnergy);
      //console.log('hiMid:'+highmidEnergy);
      //console.log('Treble:'+trebleEnergy);
      //console.log('Color:'+n);
    
    
      spectrum = fft.analyze();
      // fill(0,255,0); // spectrum is green
      //console.log(spectrum);
    
      size = map(lowmidEnergy/90, 0, 1, 15, 100);
      
      //let green = (bassenergy+lowmidEnergy)/2;
      //let blue = bassenergy;
    
      ccolor = color(n+midEnergy/2, lowmidEnergy, midEnergy);
      ccolor2 = color(lowmidEnergy, midEnergy+30, 255);
      ccolor.setAlpha(lowmidEnergy/3)
      // push();
      //   fill('blue');
      //   ellipse(width/2, height/2, size, size);    
      // pop();
    
      // background(220);
      rectMode(CORNER);
      imageMode(CENTER);    
    
      // fade out previous frame
      fill(0, 0);
      rect(0, 0, width/2, height/2);
    
      
      
  
    if(midEnergy >120 ||  lowmidEnergy > 190 || bassenergy > 50){    
      // copy previous frame and zoom in slightly, w/rotation
      // draw box on top of previous frame    
      noStroke();
      push();        
        rotateX(lowmidEnergy);
        rotateY(bassenergy*2);
        rotateZ(midEnergy*4);
        stroke(ccolor2);
        noFill();
        box(windowWidth/8);        
      pop();
      fill(ccolor);
      push();
      rotateX(bassenergy/2);      
      ellipse(0, 0, size+ (windowWidth/2), (size));  

      //prevFrameImg = get();      
      
      pop();
      //console.log(prevFrameImg);
      //image(prevFrameImg, 0, 0, (prevFrameImg.width/5) + (1+ lowmidEnergy/10), (prevFrameImg.height/10) + (1+ midEnergy/200));                
      //setTimeout(remove(),500);
      
    }
}


