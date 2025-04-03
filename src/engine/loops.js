export const e = [
      {
        "components": [1, 4],
        "coords": {
          "x": 126.21808624267578,
          "y": 347.9118347167969
        },
        "id": "J1",
        "type": ["StepWire", "Volage"],
        "value": ["none", "4V"],
        "polar": "negative"
      },
      {
        "components": [1, 2, 3],
        "coords": {
          "x": 376.7981262207031,
          "y": 347.9118347167969
        },
        "id": "J2",
        "type": ["StepWire", "StepWire", "Volage"],
        "value": ["none", "none", "4V"],
        "polar": "positive"
      },
      {
        "components": [2, 11],
        "coords": {
          "x": 657.6566162109375,
          "y": 347.9118347167969
        },
        "id": "J3",
        "type": ["StepWire", "Resistor"],
        "value": ["none", "4Ohms"]
      },
      {
        "components": [3, 9, 10],
        "coords": {
          "x": 376.7981262207031,
          "y": 203.82830810546875
        },
        "id": "J4",
        "type": ["Volage", "Resistor", "Resistor"],
        "value": ["4V", "4Ohms", "4Ohms"],
        "polar": "positive"
      },
      {
        "components": [4, 5, 10],
        "coords": {
          "x": 120.99767303466797,
          "y": 202.7842254638672
        },
        "id": "J5",
        "type": ["Volage", "StepWire", "Resistor"],
        "value": ["4V", "none", "4Ohms"],
        "polar": "negative"
      },
      {
        "components": [5, 6],
        "coords": {
          "x": 107.4245834350586,
          "y": 57.6566162109375
        },
        "id": "J6",
        "type": ["StepWire", "Volage"],
        "value": ["none", "4V"],
        "polar": "positive"
      },
      {
        "components": [6, 7],
        "coords": {
          "x": 365.3132019042969,
          "y": 50
        },
        "id": "J7",
        "type": ["Volage", "Resistor"],
        "value": ["4V", "4Ohms"],
        "polar": "negative"
      },
      {
        "components": [7, 8],
        "coords": {
          "x": 685.8468627929688,
          "y": 50
        },
        "id": "J8",
        "type": ["Resistor", "StepWire"],
        "value": ["4Ohms", "none"]
      },
      {
        "components": [8, 9, 11],
        "coords": {
          "x": 671.2296752929688,
          "y": 193.61949157714844
        },
        "id": "J9",
        "type": ["StepWire", "Resistor", "Resistor"],
        "value": ["none", "4Ohms", "4Ohms"]
      }
    ]

export default function findCircuitCycles(vertices) {
    // Create adjacency list representation of the graph
    const graph = {};
    
    // Initialize the graph
    vertices.forEach(vertex => {
        graph[vertex.id] = [];
    });
    
    // Build the adjacency list and track edges
    const edges = new Set();
    vertices.forEach(vertex => {
        vertex.components.forEach(comp => {
            vertices.forEach(other => {
                if (other.id !== vertex.id && 
                    other.components.includes(comp)) {
                    graph[vertex.id].push(other.id);
                    // Store edge in format "smaller_id-larger_id"
                    const edgeKey = [vertex.id, other.id].sort().join('-');
                    edges.add(edgeKey);
                }
            });
        });
    });
    
    const cycles = [];
    const visited = new Set();
    
    function dfs(current, start, path = []) {
        path.push(current);
        visited.add(current);
        
        const neighbors = graph[current];
        for (const neighbor of neighbors) {
            if (neighbor === start && path.length > 2) {
                cycles.push([...path, start]);
            } else if (!visited.has(neighbor)) {
                dfs(neighbor, start, path);
            }
        }
        
        path.pop();
        visited.delete(current);
    }
    
    // Find all possible cycles
    vertices.forEach(vertex => {
        dfs(vertex.id, vertex.id);
    });
    
    // Filter out duplicate cycles
    const uniqueCycles = cycles.filter((cycle, index) => {
        const cycleSet = new Set(cycle);
        const normalized = [...cycleSet].sort().join(',');
        return cycles.findIndex(c => 
            new Set(c).size === cycleSet.size && 
            [...new Set(c)].sort().join(',') === normalized
        ) === index;
    });

    // Helper function to get edges in a cycle
    function getCycleEdges(cycle) {
        const cycleEdges = new Set();
        for (let i = 0; i < cycle.length - 1; i++) {
            const edge = [cycle[i], cycle[i + 1]].sort().join('-');
            cycleEdges.add(edge);
        }
        return cycleEdges;
    }

    // Helper function to check if a cycle contains interior edges
    function hasInteriorEdges(cycleToCheck, allCycleEdges) {
        const cycleVertices = new Set(cycleToCheck.slice(0, -1));
        const cycleEdges = getCycleEdges(cycleToCheck);
        
        // Check each edge in the graph
        for (const edge of edges) {
            const [v1, v2] = edge.split('-');
            
            // Skip edges that are part of the cycle
            if (cycleEdges.has(edge)) continue;
            
            // If either vertex is not in the cycle, this edge either
            // crosses the cycle or is completely outside
            if (!cycleVertices.has(v1) || !cycleVertices.has(v2)) continue;
            
            // If we get here, we found an interior edge
            return true;
        }
        return false;
    }

    // Filter cycles that have edges running through them
    const fundamentalCycles = uniqueCycles.filter(cycle => 
        !hasInteriorEdges(cycle, edges)
    );

    return fundamentalCycles;
}