

1.Sprint 1 Backlog + Collision Handling + Working Sprint 2 simulation:

Backlog: standard grid based neighbor search completed
line 143, init method in grids.js for grid encoding
line 288, particle_to_grid method in particles.js for grid decoding and neighbor updating

Collision Handling:
line 195, solver method in particles.js
line 244, make_boundingbox in particles.js
and line 273, detect_collision method in particles.js



2.Neighbor Search : Z-Index Sorting

Z-Index Sorting:
line 372, zsort method in particles.js; 
method follows https://en.wikipedia.org/wiki/Z-order_curve

I hear many different opinions on z index sorting, I think apply zsort on particles make more sense (if zsort is for uniform grids, insertion sort later will be totally a waste since grids are static).

z-index sort is called by line 441 particles_update method in particles.js; 

sorting methods (insertion or bubble) is at line 404


comparison please see attachment



3.Particle Density & Pressure

please see line 154 sph_summation method at particles.js


4.Resolve Forces on Particle (Gravity & Pressure)

please see line 154 sph_summation method at particles.js and
line 195 solver method at particles.js 




