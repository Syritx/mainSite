const vertices = []
const indices = []

const resolution = 100;

fragmentShaderSource = 
`
precision mediump float;
uniform vec3 color;
varying vec3 fragPosition;
vec3 position = vec3(-70, 50, 0);

void main() {

    float d = distance(fragPosition, position)/200.0;
    vec3 fogColor = vec3(199.0/255.0, 184.0/255.0, 167.0/255.0);
    
    vec3 fogDifference = fogColor - color;

    gl_FragColor = vec4(color*d, 1.0);
    //gl_FragColor.rgb = 1.0 - gl_FragColor.rgb;
}
`

vertexShaderSource = 
`
precision mediump float;
attribute vec3 vertexPosition;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

varying vec3 fragPosition;

void main() {
    fragPosition = vec3(mWorld * vec4(vertexPosition, 1.0));
    gl_Position = mProj * mView * mWorld * vec4(vertexPosition, 1.0);
    gl_PointSize = 8.0;
}
`

var time = 0
var gl = null
var seed = Math.random()*100000

var isDown = false

var xlast = 0 
var ylast = 0

var xrot = 0
var yrot = 0
var zrot = 0

document.body.onmousedown = function() { 
    isDown = true
}

document.body.onmouseup = function() {
    isDown = false
}

function start() {

    var canvas = document.getElementById('terrain-context')
    gl = canvas.getContext('webgl', {
        depth: true,
        antialias: true,
    })
    if (!gl) {
        gl = canvas.getContext('webgl2')
    }
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.LINE_WIDTH)
    gl.clearColor(0.0,0.0,0.0,1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    var index = 0
    var indicesIndex = 0


    canvas.addEventListener('mousedown', function(event) {

        var glPosition = parseFloat(event.pageX / window.innerWidth - 0.5) * 2
        console.log(glPosition)
    })

    canvas.onmousedown = function() {
        console.log("hello")
    }

    for (var x = 0; x < resolution; x++) {
        for (var y = 0; y < resolution; y++) {
            
            vertices[index*3  ] = x-resolution/2
            vertices[index*3+1] = noiseLayer(x/resolution*2, y/resolution*2, 2, 0.5, 6)*50-50
            vertices[index*3+2] = y-resolution/2+3

            if (x != resolution-1 && y != resolution-1) {
                indices[indicesIndex  ] = index+resolution+1
                indices[indicesIndex+1] = index+resolution
                indices[indicesIndex+2] = index
                indices[indicesIndex+3] = index
                indices[indicesIndex+4] = index+1
                indices[indicesIndex+5] = index+resolution+1
                indicesIndex += 6
            }

            index++
        }
    }

    var shader = new Shader(vertexShaderSource, fragmentShaderSource, gl)
    var vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    var ibo = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    var positionAttr = gl.getAttribLocation(shader.program, 'vertexPosition')

    gl.vertexAttribPointer(
        positionAttr,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT, 0
    )

    gl.enableVertexAttribArray(positionAttr)
    gl.useProgram(shader.program)

    var matWorldUniformLocation = gl.getUniformLocation(shader.program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(shader.program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(shader.program, 'mProj');

    var worldMat = new Float32Array(16);
    var viewMat = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    glMatrix.mat4.identity(worldMat)
    glMatrix.mat4.lookAt(viewMat, [-70, 70, 0], [0, 0, 0], [0, 1, 0])
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), 1000/1020, 0.1, 2000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMat);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMat);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    var loop = function() {

        document.onmousemove = function(e) {

            var x =  (e.clientX/canvas.clientWidth - .5) * 2
            var y = -(e.clientY/canvas.clientHeight - .5) * 2

            if (isDown == true) {

                console.log(x + ' ' + y)

                var xdir = xlast - x
                var ydir = ylast - y
                
                xrot += xdir*3;
                yrot += ydir*3;
            }

            xlast = x
            ylast = y
        }

        gl.useProgram(shader.program)
        render(shader)
        requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
}

function noiseLayer(x, y, lacunarity, persistance, octaves) {

    var freq = .5
    var ampl = 1
    var n = 1

    for (var o = 0; o < octaves; o++) {
        n += noise(x*freq, y*freq, 100) * ampl
        freq *= lacunarity
        ampl *= persistance
    }

    return n
}

function render(shader) {
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.viewport(0,0,4000,window.outerWidth*1.05)

    if (window.innerWidth < 1600) {
        gl.viewport(0,0,4000,window.outerWidth*1.35)
    }

    shader.use()
    if (yrot > .8) yrot = .8
    if (yrot < -.2) yrot = -.2

    var viewMat = new Float32Array(16);
    glMatrix.mat4.lookAt(viewMat, [Math.sin(xrot)*90 * Math.cos(yrot), Math.sin(yrot)*90, Math.cos(xrot)*90 * Math.cos(yrot)], [0, 0, 0], [0, 1, 0])
    var matViewUniformLocation = gl.getUniformLocation(shader.program, 'mView');
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMat);

    gl.uniform3f(gl.getUniformLocation(shader.program, 'color'), 229/255.0, 214/255.0, 197/255.0)
    gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.uniform3f(gl.getUniformLocation(shader.program, 'color'), 1, 1, 1)
    gl.drawElements(gl.POINTS, indices.length, gl.UNSIGNED_SHORT, 0);
}

start()