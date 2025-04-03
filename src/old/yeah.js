// function findPairs(loops, neighborStore) {

//     let loopsCopy = loops.splice() // or [...loops]
//     let tempNeighborItem = {}

//     for (let loopIndex = 0; loopIndex < loops.length; loopIndex++) {
//         const currentLoop = loops[loopIndex];
//         tempNeighborItem["currentLoop"] = currentLoop
//         tempNeighborItem["neighbor"] = []
        
//         // Process each consecutive pair (including last-first pair)
//         for (let i = 0; i < currentLoop.length; i++) {
//         // Get the next element (or wrap around to the first element)
//         let nextIndex = (i + 1) % currentLoop.length;
        
//         let item1 = currentLoop[i];
//         let item2 = currentLoop[nextIndex];
        
//         // Create pairs in both directions
//         let pair = `${item1}+${item2}`;
//         let flipPair = `${item2}+${item1}`;
        
//         // Check other loops for the same pairs
//         for (let otherLoopIndex = 0; otherLoopIndex < loops.length; otherLoopIndex++) {
//             // Skip comparing to itself
//             if (otherLoopIndex === loopIndex) continue;
            
//             const otherLoop = loops[otherLoopIndex];
            
//             // Check each consecutive pair in the other loop
//             for (let j = 0; j < otherLoop.length; j++) {
//             let otherNextIndex = (j + 1) % otherLoop.length;
            
//             let otherItem1 = otherLoop[j];
//             let otherItem2 = otherLoop[otherNextIndex];
            
//             let otherPair = `${otherItem1}+${otherItem2}`;
            
//             // Check if either pair matches
//             if (pair === otherPair) {
//                 console.log("pair match found");
//                 console.log("Loop 1:", currentLoop);
//                 console.log("Loop 2:", otherLoop);
//                 console.log("Matching pair:", pair);

//                 let mirrorLoop = reflection(otherLoop)
//                 // insert in loop the mirror loop with the index of otherloopindex 
//                 loopsCopy.splice(otherLoopIndex, 0, mirrorLoop)
//                 console.log("mirror", mirrorLoop)
//                 console.log("loops", loopsCopy)
//             }
            
//             if (flipPair === otherPair) {
//                 console.log("flipped pair match found");
//                 console.log("Loop 1:", currentLoop);
//                 console.log("Loop 2:", otherLoop);
//                 console.log("Matching pair (flipped):", flipPair);

//                 tempNeighborItem["neighbor"].push({"from": flipPair, "which": otherLoop})

//             }
//             }
//         }
//         }

//         neighborStore.push(tempNeighborItem)
//         tempNeighborItem = []
        
//         console.log(";;;;;;;;;;;;;;;;;;;;;")
//         console.log(neighborStore)
//     }
// }


// findCircuitCycles(e)