// These are necessary definitions that let you graphics card know how to render the shader
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;

uniform int particleCount;
uniform vec3 particles[90];
uniform vec3 particleColors[90];

void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  
  float r=0.;
  float g=0.;
  float b=0.;
  
  float mult=.00000065;
  
  for(int i=0;i<90;i++){
    if(i<particleCount){
      vec3 particle=particles[i];
      vec2 pos=particle.xy;
      float mass=particle.z;
      vec3 color=particleColors[i];
      
      r+=color.r/distance(uv,pos)*mult*mass;
      g+=color.g/distance(uv,pos)*mult*mass;
      b+=color.b/distance(uv,pos)*mult*mass;
    }
  }
  
  vec4 finalColor=vec4(r-.8,g-.9,b-.4,0.1);
  gl_FragColor=finalColor;
}