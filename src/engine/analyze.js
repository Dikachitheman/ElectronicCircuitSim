// Circuit component class to store component information
export class Component {
    constructor(id, type, value) {
        this.id = id;
        this.type = type;
        this.value = this.parseValue(value);
    }

    parseValue(valueStr) {
        // Parse values like "2H", "10uf", "2A"
        const number = parseFloat(valueStr);
        const unit = valueStr.replace(/[0-9.]/g, '');
        return { number, unit };
    }
}

// Vertex class to represent circuit nodes
export class Vertex {
    constructor(data) {
        this.id = data.id;
        this.components = data.components;
        this.coords = data.coords;
        this.type = data.type;
        this.value = data.value;
        this.connections = [];
    }
}

// Circuit analyzer class
export class CircuitAnalyzer {
    constructor(verticesData) {
        this.vertices = new Map();
        this.components = new Map();
        this.initializeCircuit(verticesData);
    }

    initializeCircuit(verticesData) {
        // Create vertices
        Object.values(verticesData).forEach(data => {
            const vertex = new Vertex(data);
            this.vertices.set(vertex.id, vertex);
            
            // Create components
            data.components.forEach((compId, index) => {
                if (!this.components.has(compId)) {
                    this.components.set(compId, new Component(
                        compId,
                        data.type[index],
                        data.value[index]
                    ));
                }
            });
        });

        // Establish connections between vertices
        this.createConnections();
    }

    createConnections() {
        // Connect vertices that share components
        this.vertices.forEach(vertex1 => {
            this.vertices.forEach(vertex2 => {
                if (vertex1.id !== vertex2.id) {
                    const sharedComponents = vertex1.components.filter(comp => 
                        vertex2.components.includes(comp)
                    );
                    if (sharedComponents.length > 0) {
                        vertex1.connections.push({
                            vertex: vertex2.id,
                            components: sharedComponents
                        });
                    }
                }
            });
        });
    }

    analyzeCircuit() {
        const analysis = {
            components: {},
            nodes: {}
        };

        // Analyze each component
        this.components.forEach((component, id) => {
            switch(component.type) {
                case 'Inductor':
                    analysis.components[id] = this.analyzeInductor(component);
                    break;
                case 'Capacitor':
                    analysis.components[id] = this.analyzeCapacitor(component);
                    break;
                case 'StepWire':
                    analysis.components[id] = this.analyzeWire(component);
                    break;
            }
        });

        // Analyze voltage at each node
        this.vertices.forEach((vertex, id) => {
            analysis.nodes[id] = this.analyzeNode(vertex);
        });

        return analysis;
    }

    analyzeInductor(component) {
        return {
            type: 'Inductor',
            inductance: component.value.number,
            voltage: component.value.number * 2, // Example calculation
            current: 2 // Assuming 2A through inductors
        };
    }

    analyzeCapacitor(component) {
        return {
            type: 'Capacitor',
            capacitance: component.value.number,
            voltage: 5, // Example voltage
            current: 0.5 // Example current
        };
    }

    analyzeWire(component) {
        return {
            type: 'StepWire',
            current: parseFloat(component.value.number)
        };
    }

    analyzeNode(vertex) {
        // Calculate node voltage based on connected components
        const connectedComponents = vertex.components.map(id => 
            this.components.get(id)
        );
        
        // Simple voltage calculation (example)
        const nodeVoltage = connectedComponents.reduce((sum, comp) => {
            if (comp.type === 'Inductor') {
                return sum + comp.value.number;
            }
            return sum;
        }, 0);

        return {
            voltage: nodeVoltage,
            connectedComponents: vertex.components
        };
    }
}

// Example usage
const circuitData = {
    // Your provided data here
    0: {
        components: [1, 2, 5, 7],
        coords: {x: 234.8027801513672, y: 172.50579833984375},
        id: "J1",
        type: ['Inductor', 'StepWire', 'StepWire', 'StepWire'],
        value: ['2H', '2A', '2A', '2A']
    },
    // ... rest of your data
};

const analyzer = new CircuitAnalyzer(circuitData);
const analysis = analyzer.analyzeCircuit();
console.log('Circuit Analysis Results:', analysis);