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

 var gridsketch = function(p) {

 var count = 0;
 var tileCountX = 10;
 var tileCountY = 7;
 var tileWidth = 0;
 var tileHeight = 0;
 
 var colorStep = 15;
 
 var circleCount = 0;
 var endSize = 0;
 var endOffset = 0;
 
 var actRandomSeed = 0;
 var squareX = 0;
 var squareY = 0;
 var squares = 0;
 var seno = 0;
 var phi = 0;

 let recording = false;
 let recorder;
 let chunks = [];
 
 const fr = 60;
 var cnv;



 p.setup = function() {
  var elmnt = document.getElementById("colorgrid");
  cnv = p.createCanvas(elmnt.offsetWidth, elmnt.offsetWidth);

  cnv.parent('colorgrid');
   p.frameRate(60);
   tileWidth = p.width / tileCountX;
   tileHeight = p.height / tileCountY;


   p.noFill();
   p.stroke(0, 255);

         
 }
 
  p.draw = function() {
   p.background('#063970');       
   p.randomSeed(actRandomSeed);
    
  
  seno = (p.sin(p.radians(p.frameCount)) * 100);      

   for (var gridY = 0; gridY <= tileCountY; gridY++) {
     for (var gridX = 0; gridX <= tileCountX; gridX++) {
      p.push();
      p.translate(tileWidth * gridX, tileHeight * gridY);
       
       var colors = ['#AC1325','#d87900', '#047B4B', '#FFC0CB', '#5914A3']
      

       p.strokeWeight(4);
       p.stroke('#000000');
       p.fill(p.random(colors))
        squareX = p.random(0, 100);
        squareY = p.random(0, 100);
        p.square(squareX,squareY,120,3);
        var inside = p.random(0, 10);
        

        for (var i = 0; i < inside; i++) {
          var diameter = p.map(i, 0, inside, tileWidth, seno);                                                
          squares = 10;
          p.rectMode(p.CENTER);
          
          p.square(squareX,squareY, diameter);          
          
        }

       
        
        p.pop();
     }
   }
   
 }
 
 p.mousePressed = function() {
  actRandomSeed = p.random(100000);
}


};
 
var colorgrid = new p5(gridsketch);


