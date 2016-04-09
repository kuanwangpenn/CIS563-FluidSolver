

1.backlog: fixed some parameter proportion; fixed grid size


2.pcisph, check line 268 in particles.js, pci_converge method; explanation of the procedure is noted in comments there.

now for converging step, because of speed issue, I only try to converge three times, if the density cannot be converged to desired diff, then I give up

the issue brought by less accurate converge is for high pressure case, the force can not be estimated well; for example, when water impact the wall, for better simulate this situation, when the water hit the boundary, I scale the force up at the tangent direction of the impacting point.


3.parallel

I spent 4 days and tried two plugins:
https://adambom.github.io/parallel.js/
and
http://www.hamsters.io/

pathetic

js parallel has special requirements for the data structure; the pseudo object oriented programming trick in js can not be paralleled; only array can be treated as parallelizable structure

that's fine, I rewrite my sprint2 and rearranged my data sctructure into a bunch of arrays; then parallel packages work, but they work poorly; performance was not improved, in fact, sometimes for no reason, the speed drops to 0 fps gradually, very unstable.

so I give up parallelism.


right now, my program run in single thread, with average 16 fps (with no density color indicator), or with 13 fps (with density color indicator) on my machine (the cheapest mac, the g card is basically a piece of garbage). which is, in my opinion, pretty fast.

Overall it is very challenging, I have tried every trick I can come up with to balance the speed and accuracy in previous month for this project. the outcome is ok. hope this can be a useful reference for future student.




