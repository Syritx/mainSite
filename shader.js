class Shader {


    program = 0
    vertexShader = 0
    fragmentShader = 0

    refGL = null

    constructor(vertexShaderSource, fragmentShaderSource, GL) {

        this.refGL = GL
        this.vertexShader = GL.createShader(GL.VERTEX_SHADER)
        this.fragmentShader = GL.createShader(GL.FRAGMENT_SHADER)

        GL.shaderSource(this.vertexShader, vertexShaderSource)
        GL.shaderSource(this.fragmentShader, fragmentShaderSource)

        GL.compileShader(this.vertexShader)
        GL.compileShader(this.fragmentShader)

        this.program = GL.createProgram()
        GL.attachShader(this.program, this.vertexShader)
        GL.attachShader(this.program, this.fragmentShader)
        GL.linkProgram(this.program)
    }

    use() {
        this.refGL.useProgram(this.program)
    }
}