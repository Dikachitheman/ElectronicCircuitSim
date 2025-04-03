// nodal analysis -> KCL && KVL

export const nodal = (circuit, nodeList) => {

    const visitedRegister = []
    const voltageLoopRegister = []

    for (let vertex of circuit) {
        let thisId = vertex.id
 
        console.log("::", thisId)

        // check if list of components are in vR
        if (!vertex.components.every(item => visitedRegister.includes(item))) {
            for (let node of vertex.components) {

                // recursion with steps limit somewhere here

                if (!visitedRegister.includes(node)) {

                    console.log("node", node)

                    !voltageLoopRegister.includes(thisId) && voltageLoopRegister.push(thisId)
                    const vR = findThisNode(node, thisId, visitedRegister, voltageLoopRegister, circuit, 0)
                    console.log("here", vR)
                    console.log("endl")
                    
                }
            }
        }
    }

    console.log("vR", visitedRegister)
}

// utils
const findThisNode = (node, thisId, visitedRegister, voltageLoopRegister, circuit, count) => {
    if (count < 5) {
        for (let subVertex of circuit) {
            if (subVertex.id !== thisId) {
                console.log("sub", subVertex.id, subVertex.components)
                console.log("include", subVertex.components.includes(node))
                subVertex.components.includes(node) && !visitedRegister.includes(node) && visitedRegister.push(node)
                
                console.log("register", thisId, subVertex.id)
                subVertex.components.includes(node) && voltageLoopRegister.push(subVertex.id)

                thisId = subVertex.id
                let newNode = subVertex.components.find(x => x !== node);

                if (!visitedRegister.includes(node)) {
                    findThisNode(newNode, thisId, visitedRegister, voltageLoopRegister, circuit, count + 1);
                }            
            } 
            // else if (voltageLoopRegister.length > 1) {
            //     voltageLoopRegister.push(thisId)
            //     voltageLoopRegister.push(`__new__`)
            // }
        }
    }

    return visitedRegister, voltageLoopRegister
}

const reflection = (VLRItem) => {
    const reflectionVLR = []
    let j = 0

    for (let i = VLRItem.length; i >= 0; i--) {
        reflectionVLR[j] = i
        j++
    }

    return reflectionVLR
}