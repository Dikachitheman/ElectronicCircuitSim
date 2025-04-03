
// export const e = [
//     {
//       "components": [1, 4],
//       "coords": {
//         "x": 126.21808624267578,
//         "y": 347.9118347167969
//       },
//       "id": "J1",
//       "type": ["StepWire", "Voltage"],
//       "value": ["none", "4V"],
//       "polar": "positve"
//     },
//     {
//       "components": [1, 2, 3],
//       "coords": {
//         "x": 376.7981262207031,
//         "y": 347.9118347167969
//       },
//       "id": "J2",
//       "type": ["StepWire", "StepWire", "Voltage"],
//       "value": ["none", "none", "4V"],
//       "polar": "negative"
//     },
//     {
//       "components": [2, 11],
//       "coords": {
//         "x": 657.6566162109375,
//         "y": 347.9118347167969
//       },
//       "id": "J3",
//       "type": ["StepWire", "Resistor"],
//       "value": ["none", "4Ohms"]
//     },
//     {
//       "components": [3, 9, 10],
//       "coords": {
//         "x": 376.7981262207031,
//         "y": 203.82830810546875
//       },
//       "id": "J4",
//       "type": ["Voltage", "Resistor", "Resistor"],
//       "value": ["4V", "4Ohms", "4Ohms"],
//       "polar": "positive"
//     },
//     {
//       "components": [4, 5, 10],
//       "coords": {
//         "x": 120.99767303466797,
//         "y": 202.7842254638672
//       },
//       "id": "J5",
//       "type": ["Voltage", "StepWire", "Resistor"],
//       "value": ["4V", "none", "4Ohms"],
//       "polar": "negative"
//     },
//     {
//       "components": [5, 6],
//       "coords": {
//         "x": 107.4245834350586,
//         "y": 57.6566162109375
//       },
//       "id": "J6",
//       "type": ["StepWire", "Voltage"],
//       "value": ["none", "4V"],
//       "polar": "positive"
//     },
//     {
//       "components": [6, 7],
//       "coords": {
//         "x": 365.3132019042969,
//         "y": 50
//       },
//       "id": "J7",
//       "type": ["Voltage", "Resistor"],
//       "value": ["4V", "4Ohms"],
//       "polar": "negative"
//     },
//     {
//       "components": [7, 8],
//       "coords": {
//         "x": 685.8468627929688,
//         "y": 50
//       },
//       "id": "J8",
//       "type": ["Resistor", "StepWire"],
//       "value": ["4Ohms", "none"]
//     },
//     {
//       "components": [8, 9, 11],
//       "coords": {
//         "x": 671.2296752929688,
//         "y": 193.61949157714844
//       },
//       "id": "J9",
//       "type": ["StepWire", "Resistor", "Resistor"],
//       "value": ["none", "4Ohms", "4Ohms"]
//     }
//   ]

const reflection = (VLRItem) => {
    const reflectionVLR = []
    let j = 0

    for (let i = VLRItem.length - 1; i >= 0; i--) {
        reflectionVLR[j] = VLRItem[i]
        j++
    }

    return reflectionVLR
}

const findConnectedNodes = (circuit, id, parent, comps) => {
    let exList = []
    
    circuit.forEach((item, index) => {
        if (item.components.some(comp => comps.includes(comp)) && item.id !== circuit[id].id && item.id !== circuit[parent].id) {
            exList.push({id: item.id, index: index, parent: parent})
            // console.log(exList)
            // findConnectedNodes(circuit, index, id, item.components)
        }
    })

    return (exList)
}

const nodal = (circuit) => {
    let parent = 0
    let nodes = findConnectedNodes(circuit, 0, parent, circuit[0].components)
    let result = []
    let dict = {}
    let step = 0

    for (let node of nodes) {
        dict["sourceIndex"] = node.index
        dict["nodes"] = findConnectedNodes(circuit, node.index, parent, circuit[node.index].components)
        result.push(dict)
        dict = {}
    }

    console.log("logging")
    console.log(result)
    
    while (step < 6) {
        console.log("step", step);
        
        // Create a temporary array to store new results
        let newEntries = [];
        
        // Process current results without modifying the array we're iterating
        for (let r of result) {
            for (let node of r.nodes) {
                console.log(step);
                let dict = {};
                dict["sourceIndex"] = node.index;
                dict["nodes"] = findConnectedNodes(circuit, node.index, r.sourceIndex, circuit[node.index].components);
                
                // Add to the temporary array instead
                newEntries.push(dict);
            }
        }
        
        // After iteration is complete, add all new entries to result
        result.push(...newEntries);
        
        // Increment step once per entire iteration, not inside the inner loops
        step += 1;
    }
}

function findPairs(currentLoop, loopIndex, loopsCopy, len, tempNeighborItem) {

    let mirrorsToAdd = [];

    for (let i = 0; i < currentLoop.length; i++) {
        let nextIndex = (i + 1) % currentLoop.length;
        
        let item1 = currentLoop[i];
        let item2 = currentLoop[nextIndex];
        
        let pair = `${item1}+${item2}`;
        let flipPair = `${item2}+${item1}`;
        
        for (let otherLoopIndex = 0; otherLoopIndex < len; otherLoopIndex++) {
            if (otherLoopIndex === loopIndex) continue;
            
            const otherLoop = loopsCopy[otherLoopIndex];
            
            for (let j = 0; j < otherLoop.length; j++) {
                let otherNextIndex = (j + 1) % otherLoop.length;
                
                let otherItem1 = otherLoop[j];
                let otherItem2 = otherLoop[otherNextIndex];
                
                let otherPair = `${otherItem1}+${otherItem2}`;
                
                if (pair === otherPair) {

                    let mirrorLoop = reflection(otherLoop)
                    // insert in loop the mirror loop with the index of otherloopindex 
                    mirrorsToAdd.push({ index: otherLoopIndex, loop: mirrorLoop });

                    tempNeighborItem["neighbor"].push({"from": pair, "which": otherLoop, "index": otherLoopIndex})

                }
                
                if (flipPair === otherPair) {

                    tempNeighborItem["neighbor"].push({"from": pair, "which": otherLoop, "index": otherLoopIndex})
                }
            }
        }
    }

    mirrorsToAdd.sort((a, b) => b.index - a.index);
    for (let mirror of mirrorsToAdd) {
        loopsCopy.splice(mirror.index, 1, mirror.loop);
    }
    
    return { updatedLoopsCopy: loopsCopy, updatedTempNeighborItem: tempNeighborItem };
}

function findNonExistingIndex(neighborStore) {
    const existingPindexes = neighborStore.map(item => item.index);

    for (let item of neighborStore) {
        for (let neighbor of item.neighbor) {
            if (!existingPindexes.includes(neighbor.index)) {
                return neighbor.index; // Return the first non-existing index
            }
        }
    }

    return null;
}

function findCommonValues(array1, array2) {
    const common = array1.filter(value => array2.includes(value));
    return common[0];
}

const Impedance = (value, type) => {

    let z = null
    let f = 8
    
    try {
        if (type === "Resistor") {
            return value
        } else if (type === "DCVoltageSource") {
            return value
        } else if (type === "Capacitor") {
            // reactance(X) = 1 / 2fpC
            let reactance = 1 / ( 2 * f * 3.14 * value)
    
            // impedance = -jX
            z = -1 * Math.sqrt(-1) * reactance

        } else if (type === "Inductor") {
            // reactance(X) = 2fpL
            let reactance = 2 * f * 3.14 * value
    
            // impedance = jX
            z = Math.sqrt(-1) * reactance
        } else {
            console.log("Type doesn't exist ", type)
            // throw new Error("Invalid type. Type must be 'Resistor', 'Conductor', or 'Inductor'.");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }

    return z
}

function findCommonValuesWithIndex(info, array1, array2) {
    for (let i = 0; i < array1.length; i++) {
        if (array2.includes(array1[i])) {

            let value = Impedance(info.value[i], info.type[i])
            return {comp: array1[i], info: value, type: info.type[i], polar: info?.polar};
            // return {comp: array1[i], info: info.value[i], type: info.type[i], polar: info?.polar};
        }
    }
    return -1;
}

function getComponent(circuit, j, k) {
    for (let i = 0; i < circuit.length; i++) {
        if (circuit[i].id === j) {
            for (let n = 0; n < circuit.length; n++) {
                if (circuit[n].id === k) {
                    return findCommonValuesWithIndex( circuit[i], circuit[i].components, circuit[n].components);
                }
            }
        }
    }
    return null;
}

function handleFindPairs (loops, neighborStore) {
    let loopsCopy = [...loops]
    let tempNeighborItem = {}
    let len = loops.length
    let nextIndex = 0
    
    for (let loopIndex = 0; loopIndex < len; loopIndex++) {
        
        let currentLoop = loopsCopy[nextIndex]
        tempNeighborItem["currentLoop"] = currentLoop
        tempNeighborItem["index"] = nextIndex
        tempNeighborItem["neighbor"] = []

        let {updatedLoopsCopy, updatedTempNeighborItem} = findPairs(currentLoop, loopIndex, loopsCopy, len, tempNeighborItem)
        // console.log("item", updatedTempNeighborItem)
        neighborStore.push(updatedTempNeighborItem)
        loopsCopy = updatedLoopsCopy

        tempNeighborItem = []

        nextIndex = findNonExistingIndex(neighborStore);


        if (nextIndex !== null) {
            // console.log(`Found non-existing index: ${nextIndex}`);
            continue
        } else {
            // console.log("All neighbor indexes are already present");
            break
        }

    }

    return neighborStore
}

// ensure all args being passed are accurate, as first debugging step
export const getCurrentinEachEdge = (neighborStore, circuit) => {
    let currentMap = {}

    for (let n = 0; n < neighborStore.length; n++) {
        for (let i = 0; i < neighborStore[n].currentLoop.length - 1; i++) {
            let comp = getComponent(circuit, neighborStore[n].currentLoop[i], neighborStore[n].currentLoop[i+1])
            
            // If the component is not in the map, add it with the current index
            if (!(comp.comp in currentMap)) {
                currentMap[comp.comp] = {value: comp.info, loopIndex: neighborStore[n].index, details: comp}

            } else {
                // If the component already exists, store the first and new index
                currentMap[comp.comp] = {value: comp.info, loopIndex: [currentMap[comp.comp].loopIndex, neighborStore[n].index], details: comp}

            }

        }
    }

    return currentMap
}

export function analyzeCircuit(circuit, loops) {
    let gaussianMatrix = []
    let matrixRow = []
    let neighborStore = []
    let rowValue = []

    loops.forEach((item, index) => matrixRow.push(`I${index}`))

    gaussianMatrix.push(matrixRow)

    neighborStore = handleFindPairs(loops, neighborStore)
    let cmap = getCurrentinEachEdge(neighborStore, circuit)

    for (let i = 0; i < loops.length; i++) {

        matrixRow = [0, 0, 0]

        for (let j = 0; j < loops[i].length - 1; j++) {

            let currentLoop = loops[i]

            let component = getComponent(circuit, currentLoop[j], currentLoop[j+1])

            component.type !== "StepWire" && ( rowValue.push(component.info) )
            
        }

        let thisNeighborStoreItem = neighborStore.filter(item => item.index === i)
        
        thisNeighborStoreItem[0].neighbor.map((item, index) => {
            let component = getComponent(circuit, item.from.split("+")[0], item.from.split("+")[1])

            matrixRow.splice(item.index, 1, [component.info])
        })

        console.log("row", rowValue)
        matrixRow.splice(i, 1, rowValue)

        rowValue = []

        gaussianMatrix.push(matrixRow)
    }
    
    console.log(gaussianMatrix)
    return gaussianMatrix
}

// // Example usage:
// const result = analyzeCircuit(e, [
//     ['J1', 'J2', 'J4', 'J5', 'J1'],
//     ['J2', 'J3', 'J9', 'J4', 'J2'],
//     // ['J4', 'J9', 'J8', 'J7', 'J6', 'J5', 'J4']
//     [
//         'J4', 'J5',
//         'J6', 'J7',
//         'J8', 'J9',
//         'J4'
//       ]
// ]);


// AC. v(t) = Vmax sin(wt + a)

let currents = []

export const ACTimeDomainFunction = (t) => {

    let ar = []
    let r = null
    for (let i =  0; i < t; i++) {
        r = Discrete(result, i) // convert to compatible matrix at discrete time t
        ar.push(r)
        r = null
    }

    for (let j = 0; j < ar; j++) {
        currents = gaussian(ar[j]) // get currents at max values
    }

    // current implementation requires only max voltage = max current x z
}

export const dummy = (id) => {

    const el = [
        {1: {vmax: 94, phaseAngle: 90, impedance: 30, imax: 12, comp: "Capacitor"}},
        {2: {vmax: 24, phaseAngle: 90, impedance: 30, imax: 12, comp: "Capacitor"}},
        {3: {vmax: 24, phaseAngle: 90, impedance: 30, imax: 12, comp: "Capacitor"}},
    ]

    let e = el.find(item => Object.keys(item)[0] == id) || null;
    return e ? Object.values(e)[0] : null;
}