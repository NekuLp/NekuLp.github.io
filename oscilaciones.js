// M_2_3_01
//
// Generative Gestaltung – Creative Coding im Web
// ISBN: 978-3-87439-902-9, First Edition, Hermann Schmidt, Mainz, 2018
// Benedikt Groß, Hartmut Bohnacker, Julia Laub, Claudius Lazzeroni
// with contributions by Joey Lee and Niels Poldervaart
// Copyright 2018
//
// http://www.generative-gestaltung.de
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * draws an amplitude modulated oscillator
 *
 * KEYS
 * i                 : toggle draw info signal
 * c                 : toggle draw carrier signal
 * 1/2               : info signal frequency -/+
 * arrow left/right  : info signal phi -/+
 * 7/8               : carrier signal frequency -/+ (modulation frequency)
 * s                 : save png
 */
 'use strict';

 var sketch = function(p) {
 
   var pointCount = 600;
   var freq = 2;
   var phi = 0;
   var modFreq = 12;
 
   var drawFrequency = true;
   var drawModulation = true;
   var drawCombination = true;
 
   var angle;
   var y;
   var circleCount = 0;
   var cnv;

   
 
   p.setup = function() {
    var elmnt = document.getElementById("oscilaciones");
    cnv = p.createCanvas(elmnt.offsetWidth, elmnt.offsetWidth);

    cnv.parent('oscilaciones');
     p.noFill();
     pointCount = p.width;
   };
 
   p.draw = function() {
     p.background(0);
     p.strokeWeight(1);
 
     p.translate(0, p.height / 2);

     circleCount = 20;
 
     // draw oscillator with freq and phi
     if (drawFrequency) {
       p.beginShape();
       for (var i = 0; i <= pointCount; i++) {
         angle = p.map(i, 0, pointCount, 0, p.TAU);
         y = p.sin(angle * freq + p.radians(phi));
         y *= p.height / 4;
         p.vertex(i,y);
         p.stroke(255,0,0,255);
       }
       p.endShape();
     }
 
     // draw oscillator with modFreq
     if (drawModulation) {
       p.stroke(255,0,0,255);
       p.beginShape();
       for (var i = 0; i <= pointCount; i++) {
         angle = p.map(i, 0, pointCount, 0, p.TAU);
         y = p.cos(angle * modFreq);
         y *= p.height / 4;
         p.vertex(i,y);
       }
       p.endShape();
     }
     



    // draw module
    for (var i = 0; i < circleCount; i++) {      
      //ellipse(offset, 0, diameter, diameter);
      //arc(50, 50, 80, 80, 0, PI + QUARTER_PI, PIE);               
      let opacity = i/circleCount;
      
       // draw both combined
      p.stroke('rgba(255,0,0,'+opacity+')');
      p.strokeWeight(1);
      p.beginShape();
      for (var x = 0; x <= pointCount; x++) {
        angle = p.map(x, 0, pointCount, 0, p.TAU);
        var info = p.sin(angle * freq + p.radians(phi));
        var carrier = p.cos((angle + (x*2))* modFreq + pointCount);
        y = info * carrier;
        y *= p.height / 4;
        p.vertex(x,y);
      }
      p.endShape();
    }
    
   };
 
   p.keyPressed = function() {
     if (p.key == 's' || p.key == 'S') p.saveCanvas('oscilaciones-rojas', 'png');
 
     if (p.key == 'i' || p.key == 'I') drawFrequency = !drawFrequency;
     if (p.key == 'c' || p.key == 'C') drawModulation = !drawModulation;
 
     if (p.key == '1') freq--;
     if (p.key == '2') freq++;
     freq = p.max(freq,1);
 
     if (p.keyCode == p.LEFT_ARROW) phi -= 15;
     if (p.keyCode == p.RIGHT_ARROW) phi += 15;
 
     if (p.key == '7') modFreq--;
     if (p.key == '8') modFreq++;
     modFreq = p.max(modFreq,1);
 
     console.log('freq: ' + freq + ', phi: ' + phi + ', modFreq: ' + modFreq);
   };
 
 };
 
 var myp5 = new p5(sketch);
 

