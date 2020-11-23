class Plain {

	fragmentShaderSource = 
	`
	precision mediump float;
	varying vec3 fragColor;

	void main() {
	gl_FragColor = vec4(fragColor, 1.0);
	}
	`

	vertexShaderSource = 
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

	matWorldUniformLocation = 0
	worldMatrix = null

	seed = Math.random()*1000000
	angle = 0

	vertices = []
    indices = []
	refGL = null

	shader = null
	vbo = 0
	ibo = 0
	distance

    constructor(GL, verts, ind, dist) {
		this.refGL = GL
		this.distance = dist

		this.vertices = verts
		this.indices = ind

		this.shader = new Shader(this.vertexShaderSource, this.fragmentShaderSource, GL)
		this.vbo = GL.createBuffer()
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vbo)
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW)

		this.ibo = GL.createBuffer()
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.ibo)
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), GL.STATIC_DRAW)

	    var positionAttribLocation = GL.getAttribLocation(this.shader.program, 'vertexPosition')
	    var colorAttribLocation = GL.getAttribLocation(this.shader.program, 'vertexColor')
		GL.vertexAttribPointer(
			positionAttribLocation,
			3, 
			GL.FLOAT, 
			GL.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT,0 
		)
		GL.vertexAttribPointer(
			colorAttribLocation, 
			3,
			GL.FLOAT, 
			GL.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT
		)

		GL.enableVertexAttribArray(positionAttribLocation);
		GL.enableVertexAttribArray(colorAttribLocation);

		GL.useProgram(this.shader.program);

		this.matWorldUniformLocation = GL.getUniformLocation(this.shader.program, 'mWorld');
		var matViewUniformLocation = GL.getUniformLocation(this.shader.program, 'mView');
		var matProjUniformLocation = GL.getUniformLocation(this.shader.program, 'mProj');

		this.worldMatrix = new Float32Array(16);
		var viewMatrix = new Float32Array(16);
		var projMatrix = new Float32Array(16);
		glMatrix.mat4.identity(this.worldMatrix);
		glMatrix.mat4.lookAt(viewMatrix, [-this.distance, 50, 0], [0, 0, 0], [0, 1, 0]);
		glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), 1000/1020, 0.1, 2000.0);

		GL.uniformMatrix4fv(this.matWorldUniformLocation, GL.FALSE, this.worldMatrix);
		GL.uniformMatrix4fv(matViewUniformLocation, GL.FALSE, viewMatrix);
		GL.uniformMatrix4fv(matProjUniformLocation, GL.FALSE, projMatrix);
	}
	render() {

		var _identityMatrix = new Float32Array(16)
		glMatrix.mat4.identity(_identityMatrix)

		var angle = performance.now() / 1000 / 1 * 2 * Math.PI
        glMatrix.mat4.rotate(this.worldMatrix, _identityMatrix, 1.0, [0,0,0])
        this.refGL.uniformMatrix4fv(this.matWorldUniformLocation, this.refGL.FALSE, this.worldMatrix)

		this.refGL.clearColor(1.0, 1.0, 1.0, 1.0);
		this.refGL.clear(this.refGL.DEPTH_BUFFER_BIT | this.refGL.COLOR_BUFFER_BIT);
		this.refGL.drawElements(this.refGL.LINES, this.indices.length, this.refGL.UNSIGNED_SHORT, 0);
		this.shader.use()
	}
}