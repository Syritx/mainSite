const _cube_size = 2;
const _plains = []

function _start() {
    console.log("started")

    var canvas = document.getElementById("procedural-generation")
    var GL = canvas.getContext('webgl', {
        depth: true,
        antialias: false,
    }) 


    if (!GL) GL = canvas.getContext('experimental-webgl')
    if (!GL) {
        alert("WebGL is not supported by your browser")
        return
    }

    colors = [.3, 1.0, .4]
    start_vertices = []
    start_indicies = []

    resolution = 10
    i = 0

    for (var x = -(resolution/2); x < resolution/2; x++) {
        for (var y = -(resolution/2); y < resolution/2; y++) {

            start_vertices[i*24] =   (-.5+x)*.4
            start_vertices[i*24+1] = -.1+noise((-.5+x)/resolution,(.5+y)/resolution,100)*5
            start_vertices[i*24+2] = (.5+y)*.4

            start_vertices[i*24+3] = colors[0]
            start_vertices[i*24+4] = colors[1]
            start_vertices[i*24+5] = colors[2]

            start_vertices[i*24+6] =   (.5+x)*.4
            start_vertices[i*24+7] =   -.1+noise((.5+x)/resolution,(.5+y)/resolution,100)*5
            start_vertices[i*24+8] =   (.5+y)*.4

            start_vertices[i*24+9]  = colors[0]
            start_vertices[i*24+10] = colors[1]
            start_vertices[i*24+11] = colors[2]

            start_vertices[i*24+12] =  ( .5+x)*.4
            start_vertices[i*24+13] =  -.1+noise((.5+x)/resolution,(-.5+y)/resolution,100)*5
            start_vertices[i*24+14] =  (-.5+y)*.4

            start_vertices[i*24+15] = colors[0]
            start_vertices[i*24+16] = colors[1]
            start_vertices[i*24+17] = colors[2]

            start_vertices[i*24+18] = (-.5+x)*.4
            start_vertices[i*24+19] = -.1+noise((-.5+x)/resolution,(-.5+y)/resolution,100)*5
            start_vertices[i*24+20] = (-.5+y)*.4

            start_vertices[i*24+21] = colors[0]
            start_vertices[i*24+22] = colors[1]
            start_vertices[i*24+23] = colors[2]


            start_indicies[i*6] = i*4
            start_indicies[i*6+1] = i*4+1
            start_indicies[i*6+2] = i*4+2
            start_indicies[i*6+3] = i*4
            start_indicies[i*6+4] = i*4+2
            start_indicies[i*6+5] = i*4+3
            i++
        }
    }

    _plains[0] = new Plain(GL, start_vertices, start_indicies)

    GL.clearColor(0.0,0.0,0.0,1.0)
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT)
    GL.enable(GL.DEPTH_TEST)

    var loop = function() {
        _plains[0].render()
    }
    requestAnimationFrame(loop)
}

_start()