
'use strict';

var canvas = document.createElement('canvas');
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

var gl = canvas.getContext( 'webgl', { antialias: false } );

// -- Init program
var boxShading = new ShaderProgram(gl, 'vs', 'fs',0);
var particleShading = new ShaderProgram(gl, 'vs', 'fs',1);
var gridShading = new ShaderProgram(gl, 'vs', 'fs_white',0);

var densityShading = new ShaderProgram(gl, 'vs_vary', 'fs_vary',1);


var redShading_p = new ShaderProgram(gl, 'vs', 'fs_red',1);

var greenShading_p = new ShaderProgram(gl, 'vs', 'fs_green',1);
var redShading_b = new ShaderProgram(gl, 'vs', 'fs_red',0);




// -- Init objects
var box = new Box(gl);
box.create(gl);


var grids= new Grids();
grids.init(gl);

var fluid = new Fluid();
fluid.init(gl,box.faces,grids.grids_entity);

var ns_flag=2;

//alert(fluid.particle_box.length);
// var grid = new Grid(gl,0,0,0,0);
// grid.create(gl);


//alert(grids.grids_entity.length);
// var particle = new Particle(gl,1.0,2.0,3.0);
// particle.create(gl);


// -- Init camera
var camera = new Camera();

// -- UI control
var drag_flag= -1;
var cam_transform= mat4.create();


var rotX= 0.0;
var rotY= 0.0;
var calibX= 0.0;
var calibY= 0.0;
var drag_speed_offset=2000.0;



var requestAnimationFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
function(callback) { setTimeout(callback, 0); };




render();

var time_count= 0;
var stop_flag = 1;
var unit_test_flag = 0;
var unit_test_at = 1;
var textfill_flag=0;


var stat_fps=0;
var now = new Date().getTime();
var prev = now;
var tcount=1;

function render() {
    // -- Render
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    
    var drawmat= mat4.create();
    drawmat= mat4.rotateX(cam_transform, mat4.rotateY(cam_transform, camera.viewProj, rotX), rotY);
    
    boxShading.draw(gl, box,  drawmat);

    //gridShading.draw(gl, grids.grids_entity[1],  drawmat);
    //alert(fluid.emit_size);
    

    

    
    
    if(unit_test_flag==1){
        
        if((fluid.my_neighbor[unit_test_at].length>0)&&(fluid.particles[unit_test_at].belong_to_box>-1))
        {
            //redShading_b.draw(gl, grids.grids_entity[5],  drawmat);
            for(var i=0;i<fluid.emit_size;i++){
                fluid.solver(i,gl,time_count,stop_flag);
            }

            

            for(var i=0;i<fluid.my_neighbor[unit_test_at].length;i++){
                //redShading_p.draw(gl, fluid.particles[fluid.my_neighbor[unit_test_at][i]],  drawmat);
                greenShading_p.draw(gl, fluid.particles[fluid.my_neighbor[unit_test_at][i]],  drawmat);
            }
            redShading_b.draw(gl, grids.grids_entity[fluid.particles[unit_test_at].belong_to_box],  drawmat);


            if(textfill_flag==0){
                document.getElementById("ut_display").value+= "Total #Neighbor: " + (fluid.my_neighbor[unit_test_at].length-1) +" \n"
                for(var i=0;i<fluid.my_neighbor[unit_test_at].length;i++){
                    if(fluid.my_neighbor[unit_test_at][i] != unit_test_at){
                        document.getElementById("ut_display").value+="ID:"+ fluid.my_neighbor[unit_test_at][i] + "\n";
                        document.getElementById("ut_display").value+="density:"+ fluid.particles[fluid.my_neighbor[unit_test_at][i]].density + "\n";
                        document.getElementById("ut_display").value+="pressure:"+ fluid.particles[fluid.my_neighbor[unit_test_at][i]].pressure/100 + "\n";
                        document.getElementById("ut_display").value+=" \n"
                    }
                }
                textfill_flag=1;
            }

        }
    }else{
        for(var i=0;i<fluid.emit_size;i++){
            fluid.solver(i,gl,time_count,stop_flag);

            densityShading.draw(gl, fluid.particles[i],  drawmat);
            
        }
    }


    if(stop_flag==1){
        unit_test_flag=0;
        time_count+=1;
    }

    if(stop_flag==0){
        if(unit_test_flag==0){
            for(var i=0;i<grids.grids_size;i++){
                if(isRealValue(grids.grids_entity[i])){
                    gridShading.draw(gl, grids.grids_entity[i],  drawmat);
                }
            }
        }
    }


    //stat analysis
    stat_fps+=1;
    now = new Date().getTime();
    if(now-prev>=1000){
        //console.log(stat_fps/(tcount));
        document.getElementById('fps_display').innerHTML = stat_fps/(tcount);
        //stat_fps=0;
        tcount+=1;
        prev=now;
    }

    //sort once every 6 seconds
    // if((tcount%6==0)&&(tcount!=0)){
    //     fluid.particles_update(ns_flag);
    // }

    requestAnimationFrame(render);
}

function cleanup() {
    // Delete WebGL resources
    gl.deleteBuffer(vertexBuffer);
    gl.deleteBuffer(indexBuffer);
    gl.deleteProgram(program);

}






//ui


function startDrag(x, y) {
    drag_flag=1;
    calibX=x/drag_speed_offset;
    calibY=y/drag_speed_offset;
}

function duringDrag(x, y) {
    if(drag_flag==1){
        rotX+= x/drag_speed_offset-calibX;
        rotY-= y/drag_speed_offset-calibY;
    }
}

function stopDrag() {
    drag_flag=-1;
    calibX=0;
    calibY=0;
}

document.onmousedown = function(e) {
    //e.preventDefault();
    startDrag(e.pageX, e.pageY);
};

document.onmousemove = function(e) {
    duringDrag(e.pageX, e.pageY);
};

document.onmouseup = function() {
    stopDrag();
};

document.onclick = function(e) {
    //stop
    if(e.target.id=="stop_btn"){
        if(stop_flag==1){
            stop_flag=0;
            textfill_flag=0;
        }else{
            stop_flag=1;
            unit_test_flag=0;
            textfill_flag=0;
        }
    }

    if(e.target.id=="unit_test_btn"){
        var v= document.getElementById("p_check").value.trim();

        if(isNumeric(v))
        {
            if((parseInt(v)<2000)&&(parseInt(v)>=0)){
                unit_test_at=parseInt(v);
                unit_test_flag=1;
                stop_flag=0;
                document.getElementById("ut_display").value = '';
                textfill_flag=0;
            }  
        }
    }

    if(hasClass(e.target,"strategy")){
        ns_flag= e.target.value;
    }

    if(e.target.id=="p_check"){
        e.target.focus();
    }


};

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isRealValue(obj){
 return obj && obj !== "null" && obj!== "undefined";
}

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}
