precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_gridSize;
varying vec2 vUv;

void main() {
  float d = distance(vUv, vec2(0.5));
  float glow = smoothstep(0.4, 0.3, d);
  glow = pow(glow, 3.0); // Increase the glow intensity
  gl_FragColor = vec4(vec3(100.0, 55.5, 0.0) * glow, 1.0);
}
