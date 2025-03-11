import React, { useState, useEffect } from 'react';

// Represents a circuit component (resistor, voltage source, etc)
class Component {
  constructor(type, value, nodeA, nodeB) {
    this.type = type;    // 'resistor', 'voltageSource', etc
    this.value = value;  // ohms for resistors, volts for sources
    this.nodeA = nodeA;  // connection point A
    this.nodeB = nodeB;  // connection point B
  }
}

// Modified Nodal Analysis (MNA) solver
class CircuitSolver {
  constructor() {
    this.components = [];
    this.nodes = new Set();
    this.matrix = [];
    this.solution = [];
  }

  addComponent(component) {
    this.components.push(component);
    this.nodes.add(component.nodeA);
    this.nodes.add(component.nodeB);
  }

  solve() {
    const n = this.nodes.size;
    // Initialize matrices
    this.matrix = Array(n).fill().map(() => Array(n).fill(0));
    let b = Array(n).fill(0);

    // Build conductance matrix
    this.components.forEach(component => {
      if (component.type === 'resistor') {
        const conductance = 1 / component.value;
        // Add conductance to matrix diagonal elements
        this.matrix[component.nodeA][component.nodeA] += conductance;
        this.matrix[component.nodeB][component.nodeB] += conductance;
        // Add negative conductance to off-diagonal elements
        this.matrix[component.nodeA][component.nodeB] -= conductance;
        this.matrix[component.nodeB][component.nodeA] -= conductance;
      } else if (component.type === 'voltageSource') {
        b[component.nodeA] += component.value;
        b[component.nodeB] -= component.value;
      }
    });

    // Solve using Gaussian elimination (simplified)
    this.solution = this.gaussianElimination(this.matrix, b);
    return this.solution;
  }

  gaussianElimination(A, b) {
    const n = A.length;
    let x = Array(n).fill(0);
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const factor = A[j][i] / A[i][i];
        for (let k = i; k < n; k++) {
          A[j][k] -= factor * A[i][k];
        }
        b[j] -= factor * b[i];
      }
    }

    // Back substitution
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += A[i][j] * x[j];
      }
      x[i] = (b[i] - sum) / A[i][i];
    }

    return x;
  }
}

const Combine = () => {
  const [components, setComponents] = useState([]);
  const [voltages, setVoltages] = useState([]);
  
  const addComponent = (type, value, nodeA, nodeB) => {
    const newComponent = new Component(type, value, nodeA, nodeB);
    setComponents([...components, newComponent]);
  };

  useEffect(() => {
    if (components.length > 0) {
      const solver = new CircuitSolver();
      components.forEach(component => solver.addComponent(component));
      const solution = solver.solve();
      setVoltages(solution);
    }
  }, [components]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Circuit Simulator</h2>
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => addComponent('resistor', 1000, 0, 1)} // 1kΩ resistor
        >
          Add Resistor
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => addComponent('voltageSource', 5, 0, 1)} // 5V source
        >
          Add Voltage Source
        </button>
      </div>
      
      <div className="mt-4">
        <h3 className="font-bold">Components:</h3>
        {components.map((component, index) => (
          <div key={index} className="mt-2">
            {component.type}: {component.value} 
            (nodes: {component.nodeA} → {component.nodeB})
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <h3 className="font-bold">Node Voltages:</h3>
        {voltages.map((voltage, index) => (
          <div key={index} className="mt-2">
            Node {index}: {voltage.toFixed(2)}V
          </div>
        ))}
      </div>
    </div>
  );
};

export default Combine;