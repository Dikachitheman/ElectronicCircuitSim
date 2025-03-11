export default function findCircuitCycles(vertices) {
    // Create adjacency list representation of the graph
    const graph = {};
    
    // Initialize the graph
    vertices.forEach(vertex => {
        graph[vertex.id] = [];
    });
    
    // Build the adjacency list
    vertices.forEach(vertex => {
        vertex.components.forEach(comp => {
            // Find other vertices that share this component
            vertices.forEach(other => {
                if (other.id !== vertex.id && 
                    other.components.includes(comp)) {
                    graph[vertex.id].push(other.id);
                }
            });
        });
    });

    console.log(graph)
    
    const cycles = [];
    const visited = new Set();
    
    function dfs(current, start, path = []) {
        path.push(current);
        visited.add(current);
        
        const neighbors = graph[current];
        for (const neighbor of neighbors) {
            if (neighbor === start && path.length > 2) {
                // Found a cycle
                cycles.push([...path, start]);
            } else if (!visited.has(neighbor)) {
                dfs(neighbor, start, path);
            }
        }
        
        path.pop();
        visited.delete(current);
    }
    
    // Start DFS from each vertex
    vertices.forEach(vertex => {
        dfs(vertex.id, vertex.id);
    });
    
    // Filter out duplicate cycles (same cycle starting from different vertices)
    const uniqueCycles = cycles.filter((cycle, index) => {
        const cycleSet = new Set(cycle);
        const normalized = [...cycleSet].sort().join(',');
        return cycles.findIndex(c => 
            new Set(c).size === cycleSet.size && 
            [...new Set(c)].sort().join(',') === normalized
        ) === index;
    });
    
    console.log(uniqueCycles)
    return uniqueCycles;
}

export function findCycles(vertices) {
    const adj = {}; // Adjacency list to represent the graph
  
    // Build the adjacency list
    for (const vertex of vertices) {
      const id = vertex.id;
      const components = vertex.components;
      adj[id] = components.filter(c => vertices.find(v => v.id === c)); // Ensure only other vertices are added
    }

    console.log(adj)
  
    const cycles = [];
  
    function dfs(currentVertex, startVertex, path, visited) {
      visited[currentVertex] = true;
      path.push(currentVertex);
  
      for (const neighbor of adj[currentVertex]) {
        if (neighbor === startVertex && path.length > 2) { // Cycle detected (at least 3 vertices)
          cycles.push([...path, startVertex]); // Add the complete cycle
        } else if (!visited[neighbor]) {
          dfs(neighbor, startVertex, path, { ...visited }); // Create a copy of visited for each branch
        }
      }
  
      path.pop(); // Backtrack: Remove the current vertex from the path
    }
  
    for (const vertex of vertices) {
      const startVertex = vertex.id;
      dfs(startVertex, startVertex, [], {}); // Start DFS from each vertex to find all cycles
    }
  
    // Remove duplicate cycles (cycles that are just rotations of each other)
      const uniqueCycles = [];
      const seen = new Set();
  
      for (const cycle of cycles) {
        const sortedCycle = [...cycle].sort().join(','); // Sort to handle rotations
        if (!seen.has(sortedCycle)) {
          uniqueCycles.push(cycle);
          seen.add(sortedCycle);
        }
      }
  
      console.log(uniqueCycles)

    return uniqueCycles;
  }


  export function findCyclesgpt(vertices) {
    const graph = {};
    
    // Build adjacency list
    vertices.forEach(vertex => {
        const { id, components } = vertex;
        if (!graph[id]) graph[id] = new Set();
        components.forEach(comp => {
            if (!graph[comp]) graph[comp] = new Set();
            graph[id].add(comp);
            graph[comp].add(id);
        });
    });

    console.log(graph)
    
    const cycles = [];
    const visited = new Set();
    
    function dfs(current, start, path, parent) {
        if (visited.has(current)) {
            if (current === start && path.length > 2) {
                cycles.push([...path, start]);
            }
            return;
        }
        
        visited.add(current);
        path.push(current);
        
        for (let neighbor of graph[current]) {
            if (neighbor !== parent) {
                dfs(neighbor, start, [...path], current);
            }
        }
        
        visited.delete(current);
    }
    
    for (let vertex of Object.keys(graph)) {
        dfs(vertex, vertex, [], null);
    }

    console.log(cycles)
    
    return cycles;
}
