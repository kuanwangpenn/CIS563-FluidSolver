var Particle = function(gl,xt,yt,zt) {

    // -- Local space position
    this.belong_to_box = -1;
    this.positions = [
    // Front face
        xt, yt, zt,
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

    ]);

    // -- GL Buffers

    this.posBuffer = gl.createBuffer();


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
    }

}


var Fluid = function() {
    // this.lifetime = 5000.0;

    // constant dt


    this.time_scale= 0.1;
    this.force_scale= 0.01;
    this.colliders=[];
    this.particle_box=[];
    this.my_neighbor=[];

    this.grids=[];
    this.grid_edge_length= 1;

    this.GRAVITY= [0.0, -9.8,0.0]; 
     this.numParticles_perLoop = 10;

     var offset_tranX= -5;
     var offset_tranY= 15;
     var offset_tranZ= -5;
     var offset_scal= 8;

     this.particles = [];
     this.particles_velocity = [];
     this.emit_size=0;

     this.init = function(gl,cld,grids_xyz) {
         for (var i = 0; i < this.numParticles_perLoop; ++i) {
             for (var j = 0; j < 2*this.numParticles_perLoop; ++j) {
                for (var k = 0; k < this.numParticles_perLoop; ++k) {
                    var particle = new Particle(gl,(i+offset_tranX)/offset_scal,(j+offset_tranY)/offset_scal,(k+offset_tranZ)/offset_scal);
                    particle.create(gl);

                    this.particles.push(particle);
                    this.particles_velocity.push([0.0,0.0,0.0]);
                }
             }
         }

         this.grids= grids_xyz;
         for(var i=0;i<grids_xyz.length;i++){
            this.particle_box.push(new Array());
         }
        this.emit_size= 2*this.numParticles_perLoop*this.numParticles_perLoop*this.numParticles_perLoop;

        for(var i=0;i<this.emit_size;i++){
            this.my_neighbor.push(new Array());
        }
            
        this.make_boundingbox(cld);
    }


    this.solver = function(index,gl,global_time_count,stop_flag) {
        if(global_time_count<1000){
            var dt= this.time_scale*stop_flag;

            if(this.detect_collision(index)){
            var temp_damper= Math.random();
            var temp_damper_x= Math.random()/10;
            var temp_damper_y= Math.random()/10;
            var temp_damper_z= Math.random()/10;

            this.particles_velocity[index][0]= -this.particles_velocity[index][0]*temp_damper;
            this.particles_velocity[index][1]= -this.particles_velocity[index][1]*temp_damper;
            this.particles_velocity[index][2]= -this.particles_velocity[index][2]*temp_damper;
                        
            this.particles[index].positions[0]+= this.particles_velocity[index][0]*dt;
            this.particles[index].positions[1]+= this.particles_velocity[index][1]*dt;
            this.particles[index].positions[2]+= this.particles_velocity[index][2]*dt;

            }else{

            this.particles_velocity[index][0]+= (this.GRAVITY[0]*this.force_scale)*dt;
            this.particles_velocity[index][1]+= (this.GRAVITY[1]*this.force_scale)*dt;
            this.particles_velocity[index][2]+= (this.GRAVITY[2]*this.force_scale)*dt;

            this.particles[index].positions[0]+= this.particles_velocity[index][0]*dt;
            this.particles[index].positions[1]+= this.particles_velocity[index][1]*dt;
            this.particles[index].positions[2]+= this.particles_velocity[index][2]*dt;
            }



            this.particle_to_grid(index);
            

            this.particles[index].create(gl);
        }
    }

    this.make_boundingbox = function(cld){
        var bb_offset= 0.05;

        for(var i=0;i<cld.length;i++){
            cld_l= cld[i].length;
            var bagX=[];
            var bagY=[];
            var bagZ=[];

            for(var j=0;j<cld_l;j++){
                //assume 3 vertex to represent a point in space
                bagX.push(cld[i][j][0]);
                bagY.push(cld[i][j][1]);
                bagZ.push(cld[i][j][2]);
            }

            var minX= Math.min.apply(Math,bagX);
            var minY= Math.min.apply(Math,bagY);
            var minZ= Math.min.apply(Math,bagZ);
            var maxX= Math.max.apply(Math,bagX);
            var maxY= Math.max.apply(Math,bagY);
            var maxZ= Math.max.apply(Math,bagZ);
            var minP= [minX- bb_offset,minY- bb_offset,minZ- bb_offset];
            var maxP= [maxX+ bb_offset,maxY+ bb_offset,maxZ+ bb_offset];
            var bb= [minP,maxP];
            this.colliders.push(bb);
        }
    }

    this.detect_collision = function(index, v){
        var cp= this.particles[index].positions;
        for(var i=0;i<this.colliders.length;i++){
            if(
            ((cp[0]>this.colliders[i][0][0])&&(cp[0]<this.colliders[i][1][0]))&&
            ((cp[1]>this.colliders[i][0][1])&&(cp[1]<this.colliders[i][1][1]))&&
            ((cp[2]>this.colliders[i][0][2])&&(cp[2]<this.colliders[i][1][2]))
            )
            {
                return true;
            }
        }
        return false;
    }

    this.particle_to_grid = function(index){
        for(var i=0;i<this.particle_box.length;i++){
                var myindex = this.particle_box[i].indexOf(index);

                if(myindex > -1) {
                    this.particle_box[i].splice(index, 1);
                    //this.my_neighbor[index]= new Array();
                    //this.particles[index].belong_to_box= -1;
                }
                if(
                    ((this.grids[i][0]+this.grid_edge_length)>=this.particles[index].positions[0])&&
                    ((this.grids[i][1]+this.grid_edge_length)>=this.particles[index].positions[1])&&
                    ((this.grids[i][2]+this.grid_edge_length)>=this.particles[index].positions[2])&&
                    ((this.grids[i][0])<=this.particles[index].positions[0])&&
                    ((this.grids[i][1])<=this.particles[index].positions[1])&&
                    ((this.grids[i][2])<=this.particles[index].positions[2])
                ){
                    this.particle_box[i].push(index);
                    this.particles[index].belong_to_box= i;
                    this.my_neighbor[index]= this.particle_box[i];
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
        if(d>h){return 0;}
        return (15.0/(Math.PI*Math.pow(h,9)))*(h*h-d*d)*(h*h-d*d)*(h*h-d*d)
    }
}
