const vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;
out vec2 v_texcoord;

void main() {
  gl_Position = a_position;
  v_texcoord = a_texcoord;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_texcoord;
uniform sampler2D u_texture;
out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord);
}
`;

function shader(
  gl: WebGL2RenderingContext,
  code: string,
  shaderType: 'VERTEX_SHADER' | 'FRAGMENT_SHADER'
) {
  const sh = gl.createShader(gl[shaderType]);
  if (!sh) {
    throw Error('shader type not supported');
  }
  gl.shaderSource(sh, code);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw 'Could not compile Shader.\n\n' + gl.getShaderInfoLog(sh);
  }
  return sh;
}

// creates a texture info { width: w, height: h, texture: tex }
// The texture will start with 1x1 pixels and be updated
// when the image has loaded
function createTextureInfo(gl: WebGL2RenderingContext) {
  const tex = gl.createTexture();
  if (!tex) {
    throw new Error('Failed to gl.createTexture');
  }
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // pixel perfect render
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return tex;
}

export function setupWebGl(canvas: HTMLCanvasElement, width: number, height: number) {
  const nColors = 3; // RGB
  const pixels = new Uint8Array(width * height * nColors);

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    throw new Error('Cannot get webgl2 context');
  }
  const program = gl.createProgram();
  if (!program) {
    throw new Error('Cannot create shader program');
  }
  const frag = shader(gl, fragmentShaderSource, 'FRAGMENT_SHADER');
  const vert = shader(gl, vertexShaderSource, 'VERTEX_SHADER');

  gl.attachShader(program, frag);
  gl.attachShader(program, vert);
  gl.linkProgram(program);
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw 'Could not compile WebGL program. \n\n' + info;
  }

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const texcoordAttributeLocation = gl.getAttribLocation(program, 'a_texcoord');

  // lookup uniforms
  const textureLocation = gl.getUniformLocation(program, 'u_texture');

  // Create a vertex array object (attribute state)
  const vao = gl.createVertexArray();
  if (!vao) {
    throw new Error('Failed to createVertexArray');
  }

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, 1, 1, 1, -1, -1, -1, -1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(texcoordAttributeLocation);
  gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT, true, 0, 0);

  const tex = createTextureInfo(gl);

  const render = () => {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.bindVertexArray(vao);

    gl.uniform1i(textureLocation, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  return {
    render,
    pixels,
  };
}
