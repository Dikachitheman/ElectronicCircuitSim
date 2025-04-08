
// const matrix = [ // x=-8, y=17, z=20
//     // ['x', 'y', 'z', 'out'],
//     [26, 2, 2, 12.6],
//     [3, 27, 1, -14.3],
//     [2, 3, 17, 6]
//   ]

// function gaussSiedel(out, current, a, a_coef, b, b_coef) {

//     let a_prod = a * a_coef
//     let b_prod = b * b_coef

//     let gs = (1 / current) * (out - (a_prod + b_prod))

//     return gs
// }

// function MSELoss(out, pred) {
//     let diff = out - pred
//     return Math.abs(diff)
// }

// function iterate (x, y, z) {
    
//     let x_coef = matrix[0][0]
//     let y_coef = matrix[0][1]
//     let z_coef = matrix[0][2]
//     let out = matrix[0][3]

//     let x1_coef = matrix[1][0]
//     let y1_coef = matrix[1][1]
//     let z1_coef = matrix[1][2]
//     let out1 = matrix[1][3]

//     let x2_coef = matrix[2][0]
//     let y2_coef = matrix[2][1]
//     let z2_coef = matrix[2][2]
//     let out2 = matrix[2][3]

//     x = gaussSiedel(out, x_coef, y, y_coef, z, z_coef) 
//     console.log(x)

//     y = gaussSiedel(out1, y1_coef, x, x1_coef, z, z1_coef)
//     console.log(y)

//     z = gaussSiedel(out2, z2_coef, x, x2_coef, y, y2_coef)
//     console.log(z)

//     console.log(";;;;;;;;;;")
//     return {x, y, z}
// }

// export function gaussian(matrix) {

//     let x = 0
//     let y = 0
//     let z = 0

//     let loss = 0
//     let lossSum = 0

//     for (let i = 0; i < 4; i++) {

//         const result = iterate(x, y, z)
    
//         let x_coef = matrix[0][0]
//         let y_coef = matrix[0][1]
//         let z_coef = matrix[0][2]
//         let out = matrix[0][3]
    
//         let x1_coef = matrix[1][0]
//         let y1_coef = matrix[1][1]
//         let z1_coef = matrix[1][2]
//         let out1 = matrix[1][3]
    
//         let x2_coef = matrix[2][0]
//         let y2_coef = matrix[2][1]
//         let z2_coef = matrix[2][2]
//         let out2 = matrix[2][3]

//         x = result.x
//         y = result.y
//         z = result.z

//         console.log ("x, y, z ", x, y, z)
    
//         let pred = ( x_coef * x) + (y_coef * y) + (z_coef * z)
//         loss = MSELoss(out, pred)
//         lossSum = lossSum + loss
//         console.log("out, pred, loss",out, pred, loss)
//         pred = 0
//         loss = 0
    
//         pred = ( x1_coef * x) + (y1_coef * y) + (z1_coef * z)
//         loss = MSELoss(out1, pred)
//         lossSum = lossSum + loss
//         console.log("(out1, pred, loss", out1, pred, loss)
//         pred = 0 
//         loss = 0

    
//         pred = ( x2_coef * x) + (y2_coef * y) + (z2_coef * z)
//         loss = MSELoss(out2, pred)
//         lossSum = lossSum + loss
//         console.log("out2, pred, loss", out2, pred, loss)
//         pred = 0
//         loss = 0

    
//         console.log("estimated loss", lossSum / 3) // estimated loss
//         lossSum = 0
//     }
// }

// gaussian(matrix)

/**
 * Generalized implementation of the Gauss-Seidel method that works for matrices of any size
 */

/**
 * Calculate a single variable using the Gauss-Seidel method
 * @param {number} out - The expected output value
 * @param {number} current - Coefficient of the variable being calculated
 * @param {number[]} variables - Array of all other variable values
 * @param {number[]} coefficients - Array of coefficients for other variables
 * @return {number} - The calculated variable value
 */
function gaussSiedel(out, current, variables, coefficients) {
    let sum = 0;
    
    // Calculate sum of all other terms (a*x + b*y + ...)
    for (let i = 0; i < variables.length; i++) {
      sum += variables[i] * coefficients[i];
    }
    
    // Return the calculated value using Gauss-Seidel formula
    return (1 / current) * (out - sum);
  }
  
  /**
   * Calculate absolute error
   */
  function MSELoss(out, pred) {
    return Math.abs(out - pred);
  }
  
  /**
   * Perform one iteration of the Gauss-Seidel method
   * @param {number[]} x - Current variable values
   * @param {number[][]} matrix - Coefficient matrix with results in last column
   * @return {number[]} - Updated variable values
   */
  function iterate(x, matrix) {
    const numVariables = x.length;
    const result = [...x]; // Copy to avoid modifying input
    
    // Update each variable using Gauss-Seidel
    for (let varIndex = 0; varIndex < numVariables; varIndex++) {
      const row = matrix[varIndex];
      const output = row[numVariables]; // Last column is the output
      const currentCoef = row[varIndex]; // Coefficient for current variable
      
      // Create arrays of other variables and their coefficients
      const otherVars = [];
      const otherCoefs = [];
      
      for (let j = 0; j < numVariables; j++) {
        if (j !== varIndex) {
          otherVars.push(result[j]); // Use already updated values
          otherCoefs.push(row[j]);
        }
      }
      
      // Calculate new value for this variable
      result[varIndex] = gaussSiedel(output, currentCoef, otherVars, otherCoefs);
      // console.log(result[varIndex]);
    }
    
    // console.log(";;;;;;;;;;");
    return result;
  }
  
  /**
   * Solve a system of linear equations using the Gauss-Seidel method
   * @param {number[][]} matrix - Coefficient matrix with results in last column
   * @return {number[]} - Solution vector
   */
  export function gaussian(matrix) {
    const numRows = matrix.length;
    const numVariables = matrix[0]?.length - 1; // Last column is output
    const iterations = matrix?.length + 1
    // Validate the matrix
    if (numRows !== numVariables) {
      console.warn("Warning: Non-square coefficient matrix may lead to issues");
    }
    
    // Initialize solution vector with zeros
    let x = new Array(numVariables).fill(0);
    
    // Perform specified number of iterations
    for (let i = 0; i < iterations; i++) {
      // Update variables with one iteration
      const result = iterate(x, matrix);
      
      // Update current solution
      x = result;
      
    //   console.log("x, y, z ", ...x);
      
      let lossSum = 0;
      
      // Calculate and print losses for each equation
      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = matrix[rowIndex];
        const out = row[numVariables]; // Expected output
        
        // Calculate predicted output using current variable values
        let pred = 0;
        for (let j = 0; j < numVariables; j++) {
          pred += row[j] * x[j];
        }
        
        // Calculate loss
        const loss = MSELoss(out, pred);
        lossSum += loss;
        
        // if (rowIndex === 0) {
        //   console.log("out, pred, loss", out, pred, loss);
        // } else if (rowIndex === 1) {
        //   console.log("(out1, pred, loss", out, pred, loss);
        // } else {
        //   console.log("out" + rowIndex + ", pred, loss", out, pred, loss);
        // }
      }
      
      // Print average loss
    //   console.log("estimated loss", lossSum / numRows);
    }
    
    return x;
  }
  
  // Example usage with the provided matrix
  const matrix = [
    [26, 2, 2, 12.6],
    [3, 27, 1, -14.3],
    [2, 3, 17, 6]
  ];
  
  gaussian(matrix);