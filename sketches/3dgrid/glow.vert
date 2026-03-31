uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec4 aPosition;
varying vec2 vUv;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * aPosition;
  vUv = uv;
}
