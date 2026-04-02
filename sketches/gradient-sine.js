// P_2_1_3_01
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
 * changing circle amount, size and position in a grid
 *
 * MOUSE
 * position x          : circle amount and size
 * position y          : circle position
 * left click          : random position
 *
 * KEYS
 * s                   : save png
 */
 'use strict';

 var count = 0;
 var tileCountX = 12;
 var tileCountY = 12;
 var tileWidth = 0;
 var tileHeight = 0; 
 
 var circleCount = 0;
 var endSize = 0;
 var endOffset = 0;
 
 var actRandomSeed = 0;

 var seno = 0;
 var seno2 = 0;

 var inside = 10;
 var seed;
 
 
 function setup() {
   createCanvas(windowWidth, windowHeight);
   colorMode(RGB);
   tileWidth = width / tileCountX;
   tileHeight = height / tileCountY;      
   frameRate(60);   
   initSketch();
 }
 
 function initSketch() {
   seed = int(random(0, 10000));
   noiseSeed(seed);
   frameCount = 0;
 }
 
 function draw() {   
                  
    let from2 = color(18, 115, 32);
    let to2 = color(15, 40, 239);

    seno = (sin(radians(frameCount)) * 255);
    seno2 = (sin(radians(frameCount)) * 1);

    let from = color(seno, 100, 100, 255); //Start color
    let to = color(250, 20, seno, 75); //End color
    
    let interB = lerpColor(from2, to2, seno2); 
    
    if(seno < 0 ){
      frameCount = 0;
    }       
   
  linearGradient(
    width/2-200, height/2-200, //Start point
    width/2+200, height/2+200, //End point
    from, //Start color
    to, //End color
  );                

  stroke(interB);
  strokeWeight(2);       
   
   for (var gridY = 0; gridY <= tileCountY; gridY++) {             
     for (var gridX = 0; gridX <= tileCountX; gridX++) {                      
                
        for (var i = 0; i < inside; i++) {                                  
          push();
          let n = noise(i);          
          if (n > 0.5){
              var diameter = (tileWidth/i);   
              rectMode(CENTER);        
              square(tileWidth * gridX,tileHeight *gridY, diameter);                                        
          }
          pop();   
        }
           
      
       push();                     
        square(tileWidth * gridX, tileHeight *gridY, tileWidth * tileHeight);        
       pop();       
     }                 
   }      
 }

 function linearGradient(sX, sY, eX, eY, colorS, colorE){
  let gradient = drawingContext.createLinearGradient(
    sX, sY, eX, eY
  );
  gradient.addColorStop(0, colorS);
  gradient.addColorStop(1, colorE);
  drawingContext.fillStyle = gradient;
  // drawingContext.strokeStyle = gradient;
}
 
 function mousePressed() {
   actRandomSeed = random(100000);
 }
 
 function keyTyped() {
   if (key == 's' || key == 'S'){
    saveCanvas('gradient-sine', 'png');
    console.log('ua');
   } 

   if (key == 'r' || key == 'R') {
     initSketch();
   }

   return false;
 }
 