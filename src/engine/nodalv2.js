
const e = [
    {
      components: [1, 2],
      coords: { x: 264.05859375, y: 225.171875 },
      id: "J1",
      polar: "none",
      type: ["Resistor", "Inductor"],
      value: ["4ohms", "2H"]
    },
    {
      components: [1, 4, 5],
      coords: { x: 339.50390625, y: 230.26953125 },
      id: "J2",
      polar: "none",
      type: ["Resistor", "Inductor", "Resistor"],
      value: ["4ohms", "2H", "4ohms"]
    },
    {
      components: [2, 3],
      coords: { x: 259.98046875, y: 285.6640625 },
      id: "J3",
      polar: "positive",
      type: ["Inductor", "DCVoltageSource"],
      value: ["2H", "5VDC"]
    },
    {
      components: [3, 4, 6],
      coords: { x: 337.125, y: 297.21875 },
      id: "J4",
      polar: "none",
      type: ["DCVoltageSource", "Inductor", "Capacitor"],
      value: ["5VDC", "2H", "10uf"]
    },
    {
      components: [5, 7, 9],
      coords: { x: 403.0546875, y: 238.0859375 },
      id: "J5",
      polar: "none",
      type: ["Resistor", "DCVoltageSource", "Inductor"],
      value: ["4ohms", "5VDC", "2H"]
    },
    {
      components: [6, 7, 8],
      coords: { x: 339.50390625, y: 297.55859375 },
      id: "J6",
      polar: "none",
      type: ["Capacitor", "DCVoltageSource", "Resistor"],
      value: ["10uf", "5VDC", "4ohms"]
    },
    {
      components: [8, 10],
      coords: { x: 430.7666931152344, y: 322.4473876953125 },
      id: "J7",
      polar: "negative",
      type: ["Resistor", "DCVoltageSource"],
      value: ["4ohms", "5VDC"]
    },
    {
      components: [9, 10],
      coords: { x: 471.6123046875, y: 263.0668029785156 },
      id: "J8",
      polar: "positive",
      type: ["Inductor", "DCVoltageSource"],
      value: ["2H", "5VDC"]
    }
  ];

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
    let f = 8 // RECALL: f is 0 in DC. capacitor impedance is infinity and zero(0) in inductor. Inductor acts as short circuit
    let reactance = null
    try {
        if (type === "Resistor") {
            return value
        } else if (type === "DCVoltageSource") {
            return value
        } else if (type === "Capacitor") {

            value = value.replace("uf", "")
            value = Number(value)
            // reactance(X) = 1 / 2fpC
            reactance = 1 / ( 2 * f * 3.14 * value)
    
            // impedance = -jX
            // z = -1 * Math.sqrt(-1) * reactance
            let imaginaryComp = "-j"
            reactance = String(reactance)
            reactance = reactance.concat("uf")
            reactance = imaginaryComp.concat(reactance)

        } else if (type === "Inductor") {

            value = value.replace("H", "")
            value = Number(value)

            // reactance(X) = 2fpL
            reactance = 2 * f * 3.14 * value
    
            // impedance = jX
            // z = Math.sqrt(-1) * reactance

            let imaginaryComp = "j"
            reactance = String(reactance)
            reactance = reactance.concat("H")
            reactance = imaginaryComp.concat(reactance)

        } else {
            console.log("Type doesn't exist ", type)
            // throw new Error("Invalid type. Type must be 'Resistor', 'Conductor', or 'Inductor'.");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }

    z = reactance // RECALL: Temporary
    return z
}

function findCommonValuesWithIndex(first, second, array1, array2) {
    for (let i = 0; i < array1.length; i++) {
        if (array2.includes(array1[i])) {

            const commonValue = array1[i];
            const j = array2.indexOf(commonValue);

            let value = Impedance(first.value[i], first.type[i])

            if (first.type[i] === "DCVoltageSource" && value[0] !== "-") {
                if (first.polar === "negative") {
                    value = `-${value}`
                    console.log(value, first.id)
                }
            }

            if (second.type[j] === "DCVoltageSource" && value[0] !== "-") {
                if (second.polar === "positive") {
                    value = `-${value}`
                    console.log(value, first.id)
                }
            }

            return {comp: array1[i], info: value, type: first.type[i], polar: first?.polar};
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
                    return findCommonValuesWithIndex( circuit[i], circuit[n], circuit[i].components, circuit[n].components);
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

    return neighborStore //DEBUG: in neighnorstore, some which: [] fields dont follow the loop direction
}

// ensure all args being passed are accurate, as first debugging step
export const getCurrentinEachEdge = (neighborStore, circuit) => {
    let currentMap = {}

    for (let n = 0; n < neighborStore.length; n++) {
        for (let i = 0; i < neighborStore[n].currentLoop.length - 1; i++) {
            let comp = getComponent(circuit, neighborStore[n].currentLoop[i], neighborStore[n].currentLoop[i+1])
            
            // If the component is not in the map, add it with the current index
            if (!(comp.comp in currentMap)) {
                currentMap[comp.comp] = {value: comp.info, loopIndex: [neighborStore[n].index], details: comp}

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

        const matrixRow = Array(loops.length).fill(0);

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

        matrixRow.splice(i, 1, rowValue)

        rowValue = []

        gaussianMatrix.push(matrixRow)
    }
    
    console.log("gaussianMatrix", gaussianMatrix)
    return {matrix: gaussianMatrix, cmap}
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