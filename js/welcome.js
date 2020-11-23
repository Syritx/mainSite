const cube_size = 2;
var cubes = []

var fragmentShaderSource = 
`
precision mediump float;
varying vec3 fragColor;

void main() {
  gl_FragColor = vec4(fragColor, 1.0);
}
`

var vertexShaderSource = 
`
precision mediump float;
varying vec3 fragColor;
attribute vec3 vertexPosition;
attribute vec3 vertexColor;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  fragColor = vertexColor;
  gl_Position = mProj * mView * mWorld * vec4(vertexPosition, 1.0);
}
`

function start() {
    console.log("started")


    var canvas = document.getElementById("game")
    var GL = canvas.getContext('webgl', {
        depth: true,
        antialias: false,
    }) 


    if (!GL) GL = canvas.getContext('experimental-webgl')
    if (!GL) {
        alert("WebGL is not supported by your browser")
        return
    }

    GL.clearColor(0.0,0.0,0.0,1.0)
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT)
    GL.enable(GL.DEPTH_TEST)

    const vertexShader = GL.createShader(GL.VERTEX_SHADER)
    const fragmentShader = GL.createShader(GL.FRAGMENT_SHADER)

    GL.shaderSource(vertexShader, vertexShaderSource)
    GL.shaderSource(fragmentShader, fragmentShaderSource)

    GL.compileShader(vertexShader)
    GL.compileShader(fragmentShader)

    const program = GL.createProgram();
    GL.attachShader(program, vertexShader)
    GL.attachShader(program, fragmentShader)
    GL.linkProgram(program)

    var boxVertices = [
		-cube_size, cube_size, -cube_size,   1, 1, 1,
		-cube_size, cube_size,  cube_size,   1, 1, 1,
		 cube_size, cube_size,  cube_size,   1, 1, 1,
		 cube_size, cube_size, -cube_size,   1, 1, 1,

		// Left
		-cube_size,  cube_size,  cube_size,  0, 0.25, 0.5,
		-cube_size, -cube_size,  cube_size,  0, 0.25, 0.5,
		-cube_size, -cube_size, -cube_size,  0, 0.25, 0.5,
		-cube_size,  cube_size, -cube_size,  0, 0.25, 0.5,

		// Right
		 cube_size,  cube_size,  cube_size,  1, 0, 0,
		 cube_size, -cube_size,  cube_size,  1, 0, 0,
		 cube_size, -cube_size, -cube_size,  1, 0, 0,
		 cube_size,  cube_size, -cube_size,  1, 0, 0,

		// Front
         cube_size,  cube_size, cube_size,   1.0, 0.0, 0.15,
         cube_size, -cube_size, cube_size,   1.0, 0.0, 0.15,
		-cube_size, -cube_size, cube_size,   1.0, 0.0, 0.15,
		-cube_size,  cube_size, cube_size,   1.0, 0.0, 0.15,

		// Back
		 cube_size,  cube_size, -cube_size,  0.0, 0.0, 1,
		 cube_size, -cube_size, -cube_size,  0.0, 0.0, 1,
		-cube_size, -cube_size, -cube_size,  0.0, 0.0, 1,
		-cube_size,  cube_size, -cube_size,  0.0, 0.0, 1,

		// Bottom
		-cube_size, -cube_size, -cube_size,  0.5, 0.5, 1.0,
		-cube_size, -cube_size,  cube_size,  0.5, 0.5, 1.0,
		 cube_size, -cube_size,  cube_size,  0.5, 0.5, 1.0,
		 cube_size, -cube_size, -cube_size,  0.5, 0.5, 1.0,
    ]

    var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

    var vbo = GL.createBuffer()
    GL.bindBuffer(GL.ARRAY_BUFFER, vbo)
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(boxVertices), GL.STATIC_DRAW)

    var indexBO = GL.createBuffer()
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBO)
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), GL.STATIC_DRAW)

    var positionAttrib = GL.getAttribLocation(program, 'vertexPosition')
    var colorAttrib = GL.getAttribLocation(program, 'vertexColor')
    GL.vertexAttribPointer(
        positionAttrib,
        3,
        GL.FLOAT,
        GL.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        0
    )

    GL.vertexAttribPointer(
        colorAttrib,
        3,
        GL.FLOAT,
        GL.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    )

    GL.enableVertexAttribArray(positionAttrib)
    GL.enableVertexAttribArray(colorAttrib)

    GL.useProgram(program)
    
    var worldMatrix = GL.getUniformLocation(program, 'mWorld')
    var ViewMatrix = GL.getUniformLocation(program, 'mView')
    var ProjectionMatrix = GL.getUniformLocation(program, 'mProj')

    var projection = new Float32Array(16);
    var view = new Float32Array(16);
    var world = new Float32Array(16);
    glMatrix.mat4.identity(world)
    glMatrix.mat4.lookAt(view, [0,0,-10], [0,0,0], [0,1,0])
    glMatrix.mat4.perspective(projection, glMatrix.glMatrix.toRadian(45), canvas.width/canvas.height, 0.1, 1000.0)

    GL.uniformMatrix4fv(worldMatrix, GL.FALSE, world)
    GL.uniformMatrix4fv(ViewMatrix, GL.FALSE, view)
    GL.uniformMatrix4fv(ProjectionMatrix, GL.FALSE, projection)

    GL.viewport(0,0,GL.canvas.width, GL.canvas.height);
    
    var identityMatrix = new Float32Array(16)
    glMatrix.mat4.identity(identityMatrix)
    var angle = 0

    var loop = function() {
        angle = performance.now() / 1000 / 20 * 2 * Math.PI
        glMatrix.mat4.rotate(world, identityMatrix, angle, [50,1,10])
        GL.uniformMatrix4fv(worldMatrix, GL.FALSE, world)

        GL.clearColor(0,0,0,1.0)
        GL.clear(GL.DEPTH_BUFFER_BIT | GL.COLOR_BUFFER_BIT)
        GL.drawElements(GL.TRIANGLES, boxIndices.length, GL.UNSIGNED_SHORT, 0)
        requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
}

start()