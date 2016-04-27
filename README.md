
final changes:

1.
diffuse steps according to:
http://www.intpowertechcorp.com/GDC03.pdf

at line 533 of particle.js; this exchanges and diffuses density for each particle at every iteration, so it will stablize the simulation alittle bit



2.
add (fake) rigid body

see line 356 and 392;

it does not really interact with fluid, it just take certain grids and estimate the velocity of those particles and apply that to the big cube. real rigid body interaction still needs works...
