// vert file and comments from adam ferriss
// https://github.com/aferriss/p5jsShaderExamples

// These are necessary definitions that let you graphics card know how to render the shader
#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aPosition;

void main(){
  vec4 positionVec4=vec4(aPosition,1.);
  positionVec4.xy=positionVec4.xy*2.-1.;
  gl_Position=positionVec4;
}