var Particle = function(gl,xt,yt,zt) {

    // -- Local space position

    this.density= 1000;

    this.xy_index=0;




    this.positions = [
    // Front face
        xt, yt, zt,
    ];

    // @todo: fill up
    this.normals = new Float32Array([

    ]);

    // @todo: doesn't have to be 32-bit
    this.colors = [
        1,  1,  1,  1.0
    ];

    // @todo: fill up
    this.texcoords = new Float32Array([

    ]);

    this.indices = new Uint16Array([

    ]);

    // -- GL Buffers

    this.posBuffer = gl.createBuffer();
    this.colorBuffer = gl.createBuffer();

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
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        // @todo: fill up data for normals, texcoord, and colors
    }

}


var Grid = function (){
    this.xy_index=0;
    this.min_corner = [0,0];
    this.max_corner = [0,0];
}


var Fluid = function() {
    // this.lifetime = 5000.0;

    // constant dt


    this.time_scale= 0.01;
    this.force_scale= 1;
    this.colliders=[];
    this.particle_box=[];

    this.my_neighbor=[];

    this.grids=[];
    this.grid_edge_length= 2*1/20;

    this.GRAVITY= [0.0, -9.8,0.0]; 
     this.numParticles_perLoop = 70;

     var offset_tranX= -34;
    var offset_tranY= -34;
    var offset_tranZ= -34;
    var offset_scal= 8;

     this.particles = [];




     this.emit_size=0;


     this.init = function(gl,grids_xyz) {
         for (var i = 0; i < this.numParticles_perLoop; ++i) {
             for (var j = 0; j < this.numParticles_perLoop; ++j) {
                    var particle = new Particle(gl,(i+offset_tranX)/offset_scal,(j+offset_tranY)/offset_scal, 0 );
                    particle.create(gl);
                    particle.xy_index= i+j*this.numParticles_perLoop;
                    this.particles.push(particle);

                    var gbox= new Grid();
                    gbox.xy_index= i+j*this.numParticles_perLoop;
                    gbox.min_corner=[(i+offset_tranX)/offset_scal-this.grid_edge_length,(j+offset_tranY)/offset_scal- this.grid_edge_length];
                    gbox.max_corner=[(i+offset_tranX)/offset_scal+this.grid_edge_length,(j+offset_tranY)/offset_scal+ this.grid_edge_length];
                    this.particle_box.push(gbox);
             }
         }




        this.emit_size= this.numParticles_perLoop*this.numParticles_perLoop;


    }



    this.diffuse =function(dt){
        for(var i=0;i<this.numParticles_perLoop;i++){
            for(var j=0;j<this.numParticles_perLoop;j++){
                var decode_0 = i+(j-1)*this.numParticles_perLoop;
                var decode_1 = i-1+(j)*this.numParticles_perLoop;
                var decode_2 = i+1+(j)*this.numParticles_perLoop;
                var decode_3 = i+(j+1)*this.numParticles_perLoop;

                var decode = i+(j)*this.numParticles_perLoop;

                var diff= this.particles[decode_0].density+this.particles[decode_1].density+this.particles[decode_2].density+this.particles[decode_3].density-4*this.particles[decode].density;
                
                var a= dt*this.numParticles_perLoop*this.numParticles_perLoop*diff;

                this.particles[decode].density= this.particles[decode].density + a*diff;
            }
        }
    }

    this.kernel_poly6 = function(pa,pb){
        var h= 1.0;
        var d= Math.sqrt((pa.positions[0]-pb.positions[0])*(pa.positions[0]-pb.positions[0])+(pa.positions[1]-pb.positions[1])*(pa.positions[1]-pb.positions[1])+(pa.positions[2]-pb.positions[2])*(pa.positions[2]-pb.positions[2]));
        if(d>h){return 0;}
        return (315.0/(Math.PI*64.0*Math.pow(h,9)))*(h*h-d*d)*(h*h-d*d)*(h*h-d*d)
    }


    this.kernel_spiky = function(pa,pb){
        var h= 1.0;
        var d= Math.sqrt((pa.positions[0]-pb.positions[0])*(pa.positions[0]-pb.positions[0])+(pa.positions[1]-pb.positions[1])*(pa.positions[1]-pb.positions[1])+(pa.positions[2]-pb.positions[2])*(pa.positions[2]-pb.positions[2]));
        if(d>=h){return [0,0,0];}


        var k= (-1.0*45.0/(Math.PI*Math.pow(h,6)))*(h-d)*(h-d);
        var g= [k*(pa.positions[0]-pb.positions[0]),k*(pa.positions[1]-pb.positions[1]),k*(pa.positions[2]-pb.positions[2])];
        //console.log(d);
        //if(!isNumeric(g[0])){alert("a");}

        return g;
    }




    this.vec3_clamp= function(myv3, m_value){
        var l= Math.sqrt(myv3[0]*myv3[0]+myv3[1]*myv3[1]+myv3[2]*myv3[2]);
        if(l>m_value){
            return [myv3[0]/l*m_value, myv3[1]/l*m_value, myv3[2]/l*m_value];
        }else{
            return myv3;
        }

    }

}

