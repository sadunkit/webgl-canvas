/**
 * @param {WebGLRenderingContext} gl
 * @param {number} type
 * @param {string} source
 * @returns {WebGLShader | null}
 */
export function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  if (!shader) {
    console.error("Unable to create shader");
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // Check if compilation was successful
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export const vertices = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
// Vertex shader program
export const vsSource = `
attribute vec4 aVertexPosition;
void main() {
	gl_Position = aVertexPosition;
}
`;

// Fragment shader program
export const fsSource = `
precision mediump float;

uniform vec4 uState;
uniform vec4 uColorNormal;
uniform vec4 uColorHovered;

void main() {
	gl_FragColor = mix(uColorNormal, uColorHovered, uState.x);
}
`;
