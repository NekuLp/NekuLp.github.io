let osc; // Global oscillator
let notes = ['F4', 'G4', 'A4', 'B4', 'C4', 'D4', 'E4','F3', 'G3', 'A3', 'B3', 'C3', 'D3', 'E3', 'F2', 'G2', 'A2', 'B2', 'C2', 'D2', 'E2' ];
let melody = [];
let startTime;
let dur = 600; // 6 seconds
let audioContextStarted = false;
let delay, reverb, eq;
let eqBandIndex = 0;
let eqBandNames = ['lows', 'mids', 'highs'];

var seed;
let xoff = 0.0;
let recorder, soundFile;

let centroidplot = 0.0;
  let spectralCentroid = 0;
  let wave;
  let spec;
  let bassenergy; 
  let lowmidEnergy; 
  let midEnergy;   
  let highmidEnergy;   
  let trebleEnergy;   
  let easing = 0.05;
  let cnv;
  let prevFrameImg;

  let detailX,detailY,tubeRadius;
  let mainfreq;
  let liquify = false;
  let liquidtime = 0;  
  let repeat = false;
  
  p5.disableFriendlyErrors = true;
 

function setup() {
  seed = int(random(0,100000));
  cnv = createCanvas(1080,1080, WEBGL);  
  cnv.mousePressed(userStartAudio);
  frameRate(60);
  noiseSeed(seed);
  angleMode(DEGREES)
  //createCanvas(400, 400);
  
  colorMode(HSB, 255);
  background(0);

  mainfreq = int(random(40,60));
  detailX = int(random(3,24));
  detailY = int(random(3,16));
  tubeRadius = int(random(30,150));;

  // Create a "Start Audio" button
  let startAudioButton = createButton('Start Audio');
  startAudioButton.position(width / 2 + 300, height / 2 + 50);
  startAudioButton.mousePressed(startAudio);

  osc = new p5.Oscillator();
  osc.setType('sine');
  osc.amp(0);  

  // create a sound recorder
  recorder = new p5.SoundRecorder();

  // create an empty sound file that we will use to playback the recording
  soundFile = new p5.SoundFile();
  
  eq = new p5.EQ(eqBandNames.length);

    //sound = new p5.AudioIn();
  //sound.start();
  fft = new p5.FFT();
  osc.connect(fft);  

  delay = new p5.Delay();
  //reverb = new p5.Reverb();
  delay.process(osc, 0.400, .545);
  //reverb.process(osc, 8, 0, 0);
  eq.process(osc);
  eq.bands[0].gain(200);
  eq.bands[1].gain(-500);
  eq.bands[2].gain(-1400);
  //reverb.drywet(1);  

  // connect the mic to the recorder
  recorder.setInput(delay);

  noLoop();
}

function startAudio() {
  if (!audioContextStarted) {
    userStartAudio().then(function () {
      audioContextStarted = true;
      startMelody(); // Start the melody after audio context is initiated
      removeElements(); 
    }).catch(function (error) {
      console.error('Error starting audio context:', error);
    });
  }
}



function startMelody() {
  
  if(repeat){
    startTime = 0;
    console.log(frameCount);
  }else{
    startTime = 0;

    for (let i = 0; i < 30; i++) { // Populate melody with some notes
      let randomIndex = floor(random(notes.length));
      let randomNote = notes[randomIndex];
      melody.push(randomNote);
    }
  }

  
  //console.log(startTime);
  osc.phase(0.111);
  osc.freq(mainfreq, 4); // 440 Hz (A4)
  osc.amp(0.38, 4);  
  osc.start(0);

  recorder.record(soundFile);  
  loop(); // Start the melody
  
  
}

function draw() {  

  xoff = xoff + .01;

  wave = fft.waveform();
  spec = fft.analyze();
  bassenergy = fft.getEnergy('bass')
  lowmidEnergy = fft.getEnergy('lowMid')
  midEnergy = fft.getEnergy('mid')
  highmidEnergy = fft.getEnergy('highMid')
  trebleEnergy = fft.getEnergy('treble')

  

  //let elapsedTime = millis() - startTime;
  let elapsedTime = frameCount;
  let index = floor(map(elapsedTime, 0, dur, 0, melody.length));  

  
  let currentNote = melody[index];
  
  
  
      //xoff = 0.0;
      
      let n = noise(xoff) * (255);    
      //console.log('bass:'+bassenergy);
      //console.log('lowMid:'+lowmidEnergy)
      //console.log('Mids:'+midEnergy);
      //console.log('hiMid:'+highmidEnergy);
      //console.log('Treble:'+trebleEnergy);
      //console.log('Color:'+n);
    
    
      let spectrum = fft.analyze();
      // fill(0,255,0); // spectrum is green
      //console.log(spectrum);
    
      let size = map(lowmidEnergy/40, 0, 1, 15, 100);
      
      
    
      let ccolor = color(n+80, lowmidEnergy, lowmidEnergy+10);
      let ccolor2 = color(n-trebleEnergy, 255, 255);
      ccolor.setAlpha(lowmidEnergy/14)
  
    
      // background(220);
      rectMode(CORNER);
      imageMode(CENTER);    
    
      // fade out previous frame
      fill(0, 0);      
    
      // draw box on top of previous frame    
      noStroke();
      push();        
        rotateX(bassenergy/2);
        rotateY(lowmidEnergy);
        rotateZ(midEnergy * 2);
        stroke(ccolor2);
        noFill();
        //box(140);
        //box(windowWidth/8, windowHeight/8);
        torus(windowWidth/20, tubeRadius, detailX, detailY);


      pop();


      fill(ccolor);
      //rotate(0.099 * (bassenergy));
      ellipse(0, 0, size+ width/2, (size + (midEnergy/2)));          
  

      //text(currentNote || "", width / 2, height / 2); // Use "currentNote || "" to handle undefined case

  // Play the current note
  if (currentNote && audioContextStarted) {
    let freqz = noteToFreqz(currentNote);
    // drawFrequencyLine(freqz);        
    
    playSound(currentNote);
  }

  if (index == melody.length - 1) {
    if(!liquify){
      console.log('stop');
      
      lowerV();
      //noLoop();
      liquify = true;
    }
    
  }

  if(liquify){
    console.log('entro')
    liquidtime = liquidtime + 1;

    if(!repeat){
      // copy previous frame and zoom in slightly, w/rotation
      prevFrameImg = get();
      push();
        rotate(0.0030 * (bassenergy));      
        image(prevFrameImg, 0, 0, prevFrameImg.width + (1+ lowmidEnergy/8), prevFrameImg.height + (1+ lowmidEnergy/6));      
      pop();
    }
    
    if (liquidtime == 400){
      liquify = false;
      recorder.stop();            
      osc.stop();          
      noLoop();
      repeat = true;
      liquify = false;
      liquidtime = 0;
    }
  }
    
}

function lowerV(){  
  osc.freq(2.22,6);
  osc.amp(0, 7);  
}
function playSound(note) {
  // Create a p5 Oscillator and play the note
  
  let noteFreq = noteToFreqz(note);
  osc.freq(noteFreq); // Set the global oscillator to the note's frequency  
}

function noteToFreqz(note) {
  if (!note) return 0; // Return 0 if the note is undefined
  let noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  let octave = int(note.charAt(note.length - 1));
  let noteName = note.substring(0, note.length - 1);
  let semitone = noteNames.indexOf(noteName);
  let freqz = mainfreq * pow(2, (semitone - 9 + octave * 12) / 12);
  return freqz;
}

function keyTyped() {
  if (key == 's' || key == 'S'){
   saveCanvas('melody-randomizer', 'png');
   console.log('ua');
  } 

  
  if(!isLooping()){
    if (key == 'r' || key == 'R'){
      background(0);      
      //redraw(15);
      //startAudio();
      startMelody();
      //recorder.record(soundFile);  
      // reverb.dispose();
      // reverb.disconnect();
      //remove();
    } 
  }
  

  if (key == 'x' || key == 'X'){
    saveSound(soundFile, 'melody_randomizer');
  }

  return false;
}