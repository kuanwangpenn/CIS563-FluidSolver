var Box = function(gl) {

    // -- Local space position

    //for passing to find boundingbox
    this.faces =[];

    //six faces
    this.faces.push(
        [
        [-1.0, -1.0,  1.0],
         [1.0, -1.0,  1.0],
         [1.0,  1.0,  1.0],
        [-1.0,  1.0,  1.0]
        ]
    );
    this.faces.push(
        [
        [-1.0, -1.0, -1.0],
        [-1.0,  1.0, -1.0],
         [1.0,  1.0, -1.0],
         [1.0, -1.0, -1.0]
        ]
    );
    // this.faces.push(
    //     [
    //     [-1.0,  1.0, -1.0],
    //     [-1.0,  1.0,  1.0],
    //      [1.0,  1.0,  1.0],
    //      [1.0,  1.0, -1.0]
    //     ]
    // );
    this.faces.push(
        [
        [-1.0, -1.0, -1.0],
         [1.0, -1.0, -1.0],
         [1.0, -1.0,  1.0],
        [-1.0, -1.0,  1.0]
        ]
    );
    this.faces.push(
        [
         [1.0, -1.0, -1.0],
         [1.0,  1.0, -1.0],
         [1.0,  1.0,  1.0],
         [1.0, -1.0,  1.0]
        ]
    );
    this.faces.push(
        [
        [-1.0, -1.0, -1.0],
        [-1.0, -1.0,  1.0],
        [-1.0,  1.0,  1.0],
        [-1.0,  1.0, -1.0]
        ]
    );

    this.positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    
    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,
    
    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
    
    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,
    
    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
    
    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
    ];

    // @todo: fill up
    this.normals = new Float32Array([

    ]);

    // @todo: doesn't have to be 32-bit
    this.colors = new Float32Array([

    ]);

    // @todo: fill up
    this.texcoords = new Float32Array([

    ]);

    this.indices = new Uint16Array([
    0,  1,  2,      1,  2,  3,    // front
    2,  3,  0,      3,  0,  1,

    4,  5,  6,      5,  6,  7,    // back
    6,  7,  4,      7,  4,  5,

    8,  9,  8,     9,  10, 9,   // top
    10, 11, 10,      11, 8,  11,

    12, 13, 14,     13, 14, 15,   // bottom
    14, 15, 12,     15, 12, 13,

    16, 17, 18,     17, 18, 19,   // right
    18, 19, 16,     19, 16, 17,

    20, 21, 22,     21, 22, 23,    // left
    22, 23, 20,     23, 20, 21

    ]);

    // -- GL Buffers

    this.posBuffer = gl.createBuffer();
    this.norBuffer = gl.createBuffer();
    this.idxBuffer = gl.createBuffer();

    this.idxCount = this.indices.length;

    // -- TRANSFORMATIONS

    this.model = mat4.create();

    this.translate = function(newPosition) {

    }

    this.rotate = function(radx, rady, radz) {
        mat4.rotateX(this.model, this.model, radx * Math.PI);
        mat4.rotateY(this.model, this.model, rady * Math.PI);
        mat4.rotateZ(this.model, this.model, radz * Math.PI);
    }

    // -- FUNCTIONS


    // -- Create function. Must call during intialization
    this.create = function(gl) {

        // Position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

        // @todo: fill up data for normals, texcoord, and colors

        // Element buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    }
}
