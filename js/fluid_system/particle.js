var Particle = function(gl,xt,yt,zt) {

    // -- Local space position
    this.belong_to_box = -1;
    this.density= 1.0;
    this.pressure =1.0;
    this.f = [0.0,0.0,0.0];
    this.mass= 1.0;
    this.z_index=0;
    this.velocity=[0.0,0.0,0.0];



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
    this.grid_edge_length= 2*1/4;

    this.GRAVITY= [0.0, -9.8,0.0]; 
     this.numParticles_perLoop = 10;

     var offset_tranX= -5;
     var offset_tranY= -5;
     var offset_tranZ= -4.5;
     var offset_scal= 8;

     this.particles = [];




     this.emit_size=0;


     this.init = function(gl,cld,grids_xyz) {
         for (var i = 0; i < this.numParticles_perLoop; ++i) {
             for (var j = 0; j < this.numParticles_perLoop; ++j) {
                for (var k = 0; k < this.numParticles_perLoop; ++k) {
                    var particle = new Particle(gl,(i+offset_tranX)/offset_scal,(j+offset_tranY)/offset_scal,(k+offset_tranZ)/offset_scal);
                    particle.create(gl);

                    var zscore= this.zsort(i,j,k);
                    particle.z_index= zscore;

                 

                    this.particles.push(particle);

                    
                }
             }
         }


         this.particles_update(2);



         this.grids= grids_xyz;
         for(var i=0;i<grids_xyz.length;i++){
            this.particle_box.push(new Array());
         }
        this.emit_size= this.numParticles_perLoop*this.numParticles_perLoop*this.numParticles_perLoop;




        for(var i=0;i<this.emit_size;i++){
            this.my_neighbor.push(new Array());
        }
            
        this.make_boundingbox(cld);
    }



    this.update = function(index,dt){
       this.sph_summation(index,dt);
    }

    this.sph_summation =function(index, dt){
        var stiffness= 6.2;
        var static_water_ru= 1.0;
        var min_thres= 20;

        if((this.my_neighbor[index].length>0)&&(this.particles[index].belong_to_box>-1)){
            var t_density= 1.0;
            var t_pressure= 1.0;
            var t_fpressure= [0.0,0.0,0.0];

            //alert(this.my_neighbor[index].length);

            for(var i=0;i<this.my_neighbor[index].length;i++){
                t_density=t_density+ this.particles[this.my_neighbor[index][i]].mass*this.kernel_poly6(this.particles[index],this.particles[this.my_neighbor[index][i]]);
                if(this.my_neighbor[index].length<=min_thres){t_density= static_water_ru;}

                t_pressure= stiffness*(t_density-static_water_ru);
                //if(t_pressure<1){t_pressure=1;}
                if(this.my_neighbor[index].length<=min_thres){t_pressure= 1;}

                var spikyg= this.kernel_spiky(this.particles[index],this.particles[this.my_neighbor[index][i]]);
                //console.log(spikyg[0]);
                //if(!isNumeric(spikyg[0])){alert(spikyg);}
                // if(!((isNumeric(spikyg[0]))&&(isNumeric(spikyg[1]))&&(isNumeric(spikyg[2])))){
                //     spikyg= [0,0,0];
                // }

                t_fpressure= [t_fpressure[0]+this.particles[this.my_neighbor[index][i]].mass/this.particles[this.my_neighbor[index][i]].density*(t_pressure+this.particles[this.my_neighbor[index][i]].pressure)/2.0*spikyg[0]
                ,t_fpressure[1]+this.particles[this.my_neighbor[index][i]].mass/this.particles[this.my_neighbor[index][i]].density*(t_pressure+this.particles[this.my_neighbor[index][i]].pressure)/2.0*spikyg[1]
                ,t_fpressure[2]+this.particles[this.my_neighbor[index][i]].mass/this.particles[this.my_neighbor[index][i]].density*(t_pressure+this.particles[this.my_neighbor[index][i]].pressure)/2.0*spikyg[2]];
                                
            }
            //alert(t_fpressure);

            this.particles[index].density= t_density;
            this.particles[index].pressure= t_pressure;
            this.particles[index].f= [-t_fpressure[0],-t_fpressure[1],-t_fpressure[2]];

        }
    }

    this.solver = function(index,gl,global_time_count,stop_flag) {

        if(global_time_count<10000){
            this.particle_to_grid(index,0);

            var dt= this.time_scale*stop_flag;

            if(this.detect_collision(index).length>0){
            var cindex= this.detect_collision(index);
            var a=1;
            var b=1;
            var c=1;
            for(var i=0;i<cindex.length;i++){
                if((cindex[i]==0)||(cindex[i]==1)){c=-12;}
                if((cindex[i]==2)){b=-12;}
                if((cindex[i]==3)||(cindex[i]==4)){a=-12;}
            }
            
            this.particles[index].velocity[0]= a*(this.GRAVITY[0]*this.force_scale*this.particles[index].density+this.particles[index].f[0]*this.force_scale)/this.particles[index].density*dt;
            this.particles[index].velocity[1]= b*(this.GRAVITY[1]*this.force_scale*this.particles[index].density+this.particles[index].f[1]*this.force_scale)/this.particles[index].density*dt;
            this.particles[index].velocity[2]= c*(this.GRAVITY[2]*this.force_scale*this.particles[index].density+this.particles[index].f[2]*this.force_scale)/this.particles[index].density*dt;

            }else{

            this.particles[index].velocity[0]+= (this.GRAVITY[0]*this.force_scale*this.particles[index].density+this.particles[index].f[0]*this.force_scale)/this.particles[index].density*dt;
            this.particles[index].velocity[1]+= (this.GRAVITY[1]*this.force_scale*this.particles[index].density+this.particles[index].f[1]*this.force_scale)/this.particles[index].density*dt;
            this.particles[index].velocity[2]+= (this.GRAVITY[2]*this.force_scale*this.particles[index].density+this.particles[index].f[2]*this.force_scale)/this.particles[index].density*dt;

            }


            this.particles[index].positions[0]+= this.particles[index].velocity[0]*dt;
            this.particles[index].positions[1]+= this.particles[index].velocity[1]*dt;
            this.particles[index].positions[2]+= this.particles[index].velocity[2]*dt;            


            this.particle_to_grid(index,1);

            //this.particles[index].z_index= this.zsort(Math.floor(this.particles[index].positions[0]),Math.floor(this.particles[index].positions[1]),Math.floor(this.particles[index].positions[2]));


            this.update(index,dt);
            

            this.particles[index].create(gl);

            //this.sort_insertion(this.particles);
        }
    }

    this.make_boundingbox = function(cld){
        var bb_offset= 0.1;

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
        var hit= [];
        for(var i=0;i<this.colliders.length;i++){
            if(
            ((cp[0]>this.colliders[i][0][0])&&(cp[0]<this.colliders[i][1][0]))&&
            ((cp[1]>this.colliders[i][0][1])&&(cp[1]<this.colliders[i][1][1]))&&
            ((cp[2]>this.colliders[i][0][2])&&(cp[2]<this.colliders[i][1][2]))
            )
            {
                hit.push(i);
            }
        }
        return hit;
    }

    this.particle_to_grid = function(index,flag){
        //this offset values can be achieved by check the smallest grid xyz
        var offset_tranX= -3;
        var offset_tranY= -2;
        var offset_tranZ= -2;
        var iLength= 12;
        var jLength= 14;

        var tx= this.particles[index].positions[0];
        var ty= this.particles[index].positions[1];
        var tz= this.particles[index].positions[2];

        var i= Math.floor((tx-offset_tranX)/this.grid_edge_length) + Math.floor(((ty-offset_tranY)/this.grid_edge_length))*iLength + Math.floor(((tz-offset_tranZ)/this.grid_edge_length))*iLength*jLength;

        //console.log(tx)
        //alert(this.particle_box.length);
        // if(isNumeric(i)&&(i>=0)&&(i<this.particle_box.length-1)){
        //is useful when your grids don't cover simulation scene
        // if((i>this.particle_box.length)||(i<0)){
        //     return 0;
        // }

        if(flag==0){
            //remove
            //console.log(this.particle_box.length);
            if(this.particle_box[i].indexOf(index)>-1){
                this.particle_box[i].splice(this.particle_box[i].indexOf(index),1);
                this.my_neighbor[index]= [];
                this.particles[index].belong_to_box =-1;
            }
            
        }

        if(flag==1){
            var nsarray = [];
            for(var a=0;a<3;a++){
                for(var b=0;b<3;b++){
                    for(var c=0;c<3;c++){
                        var ti= (Math.floor((tx-offset_tranX)/this.grid_edge_length)-1+a) + (Math.floor(((ty-offset_tranY)/this.grid_edge_length))-1+b)*iLength + (Math.floor(((tz-offset_tranZ)/this.grid_edge_length))-1+c)*iLength*jLength;

                        if((ti>=0)&&(ti<this.particle_box.length-1)){
                            nsarray= nsarray.concat(this.particle_box[ti]);
                        }
                    }
                }
            }

            //add

            this.particle_box[i].push(index);
            this.my_neighbor[index]= this.particle_box[i];
            this.particles[index].belong_to_box = i;
            this.my_neighbor[index]= nsarray;
        }
        // }else{
        //     //if(!isNumeric(i)){alert(this.particles[index].f[0])} 
        // }
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


    this.zsort = function(x,y,z){
        var xs= "0"+(x>>>0).toString(2);
        var ys= "0"+(y>>>0).toString(2);
        var zs= "0"+(z>>>0).toString(2);

        var xsL= xs.length;
        var ysL= ys.length;
        var zsL= zs.length;
        var check= [xsL,ysL,zsL];

        var maxL= Math.max(...check);

        while(xs.length<maxL){
            xs= "0"+xs;
        }
        while(ys.length<maxL){
            ys= "0"+ys;
        }
        while(zs.length<maxL){
            zs= "0"+zs;
        }

        bin="";
        
        for(var i=0;i<maxL;i++){
            bin= zs[maxL-1-i]+ ys[maxL-1-i]+ xs[maxL-1-i]+bin;
        }

        //alert(xs+","+ys+","+zs+","+bin+","+parseInt(bin,2));
        return parseInt(bin,2);
    }

    this.sort_insertion= function(arr){
        for(var i=1;i<arr.length;i++){
            var c= arr[i];
            var cposition= i;
            while((cposition>0)&&(arr[cposition-1].z_index>c.z_index)){
                arr[cposition]= arr[cposition-1];
                cposition=cposition-1;
            }
            arr[cposition]= c;
        }
    }

    this.sort_bubble= function(arr){
        var l= arr.length-1;
        do{
            var swap= false;
            for(var i=0;i<l;i++){
                if(this.cmp_func(arr[i],arr[i+1])>0){
                    var temp= arr[i];
                    arr[i]= arr[i+1];
                    arr[i+1]= temp;
                    swap= true;
                }
            }
        }while(swap==true);
    }

    this.cmp_func= function(a,b){
        if(a.z_index>b.z_index){
            return 1;
        }
        if(a.z_index<b.z_index){
            return -1;
        }
        return 0;
    }

    this.particles_update= function(ns_flag){
        if(ns_flag==1){
            this.sort_bubble(this.particles);
        }
        if(ns_flag==2){
            this.sort_insertion(this.particles);
        }
        
    }

}

