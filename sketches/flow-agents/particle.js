// By 创意编程Oliver
// Github: https://github.com/ChihYungChang
// Twitter: https://twitter.com/chihyungchang66
// Openprocessing: https://openprocessing.org/user/324595?o=2&view=sketches
// Youtube: https://www.youtube.com/@creative-coder-oliver

class Particle {
    constructor(x, y, noiseXInit, noiseYInit, color) {
      this.pos = new p5.Vector(x, y);
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(20));
      this.vel.rotate(radians(random(-25, 25)));
      this.mass = random(1, 300);
      this.airDrag = random(0.12, 4.98);
      this.color = color;
  
      this.noiseX = noiseXInit + random(-5.5, 5.5);
      this.noiseY = noiseYInit + random(-5.5, 10.5);
      this.noiseScale = random(0.005, 0.0999);
    }
  
    move() {
      let x = noise(this.noiseX) * 6 - 2.8;
      let y = noise(this.noiseY) * 6 - 2.8;
      if (this.pos.x < 0) {
        this.pos.x = height;
      }
      if (this.pos.x > height) {
        this.pos.x = 0;
      }
      if (this.pos.y < 0) {
        this.pos.y = height;
      }
      if (this.pos.y > height) {
        this.pos.y = 0;
      }
      this.noiseX += this.noiseScale;
      this.noiseY += this.noiseScale;
  
      this.pos.add(x, y);
    }
  }
  
  function ParticleGroup() {
    this.draw = () => {
      for (let i = 0; i < particleList.length; i++) {
        const p = particleList[i];
        p.move();
      }
  
      return this.serialize();
    };
  
    this.serialize = () => {
      const data = {
        particles: [],
        particleColors: [],
      };
      for (let i = 0; i < particleList.length; i++) {
        const p = particleList[i];
        let itsColor = p.color;
  
        data.particles.push(
          map(p.pos.x, 0, height, 0.0, 1.0),
          map(p.pos.y, 0, height, 1.0, 0.0),
          (p.mass * p.vel.mag()) / 100
        );
        data.particleColors.push(red(itsColor), green(itsColor), blue(itsColor));
      }
  
      return data;
    };
  }
  