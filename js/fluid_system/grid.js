var Grid = function(gl,scale,offset_x,offset_y,offset_z) {

    // -- Local space position
    this.corner=[-1.0/scale+offset_x, -1.0/scale+offset_y, -1.0/scale+offset_z];

    this.positions = [
    // Front face
    -1.0/scale+offset_x, -1.0/scale+offset_y,  1.0/scale+offset_z,
     1.0/scale+offset_x, -1.0/scale+offset_y,  1.0/scale+offset_z,
     1.0/scale+offset_x,  1.0/scale+offset_y,  1.0/scale+offset_z,
    -1.0/scale+offset_x,  1.0/scale+offset_y,  1.0/scale+offset_z,
    
    // Back face
    -1.0/scale+offset_x, -1.0/scale+offset_y, -1.0/scale+offset_z,
    -1.0/scale+offset_x,  1.0/scale+offset_y, -1.0/scale+offset_z,
     1.0/scale+offset_x,  1.0/scale+offset_y, -1.0/scale+offset_z,
     1.0/scale+offset_x, -1.0/scale+offset_y, -1.0/scale+offset_z,
    
    // Top face
    -1.0/scale+offset_x,  1.0/scale+offset_y, -1.0/scale+offset_z,
    -1.0/scale+offset_x,  1.0/scale+offset_y,  1.0/scale+offset_z,
     1.0/scale+offset_x,  1.0/scale+offset_y,  1.0/scale+offset_z,
     1.0/scale+offset_x,  1.0/scale+offset_y, -1.0/scale+offset_z,
    
    // Bottom face
    -1.0/scale+offset_x, -1.0/scale+offset_y, -1.0/scale+offset_z,
     1.0/scale+offset_x, -1.0/scale+offset_y, -1.0/scale+offset_z,
     1.0/scale+offset_x, -1.0/scale+offset_y,  1.0/scale+offset_z,
    -1.0/scale+offset_x, -1.0/scale+offset_y,  1.0/scale+offset_z,
    
    // Right face
     1.0/scale+offset_x, -1.0/scale+offset_y, -1.0/scale+offset_z,
     1.0/scale+offset_x,  1.0/scale+offset_y, -1.0/scale+offset_z,
     1.0/scale+offset_x,  1.0/scale+offset_y,  1.0/scale+offset_z,
     1.0/scale+offset_x, -1.0/scale+offset_y,  1.0/scale+offset_z,
    
    // Left face
    -1.0/scale+offset_x, -1.0/scale+offset_y, -1.0/scale+offset_z,
    -1.0/scale+offset_x, -1.0/scale+offset_y,  1.0/scale+offset_z,
    -1.0/scale+offset_x,  1.0/scale+offset_y,  1.0/scale+offset_z,
    -1.0/scale+offset_x,  1.0/scale+offset_y, -1.0/scale+offset_z
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

var Grids = function() {

    this.grids_entity = [];
    this.grids_xyz= [];
    this.grids_entity_z=[];
    this.grids_xyz_z= [];
    this.z_key=[];

    this.grids_size= 0;
    this.num_perloop= 3;
    this.gscale= 4;
    this.grid_edge_length= 2*1/this.gscale;


    var offset_tranX= -2.75;
    var offset_tranY= -1.75;
    var offset_tranZ= -1.75;
    var offset_scal= 8;

    var iLength= 12;
    var jLength= 14;

    this.init = function(gl) {

        for (var i = 0; i < iLength; i++) {
             for (var j = 0; j < jLength; j++) {
                for (var k = 0; k < 8; k++) {
                    var grid = new Grid(gl,this.gscale,offset_tranX+i*this.grid_edge_length,offset_tranY+j*this.grid_edge_length,offset_tranZ+k*this.grid_edge_length);
                    grid.create(gl);
                    this.grids_entity[i+j*iLength+k*iLength*jLength]= grid;
                    this.grids_xyz[i+j*iLength+k*iLength*jLength]= grid.corner;

                }
             }
         }
        
         this.grids_size= this.grids_entity.length;
         //alert(this.grids_size);
    }




}