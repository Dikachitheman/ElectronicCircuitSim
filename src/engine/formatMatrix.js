export function Discrete(results, alpha) {
    /**
     * Convert results matrix to 4-column matrix
     * 
     * @param {Array} results - Input results matrix
     * @param {number} alpha - alpha value for AC voltage calculations
     * @returns {Array} Converted matrix with 4 columns
     */


    // Parse voltage value from string
    const parseVoltage = (val) => {
        const numericValue = parseFloat(val.replace('VDC', '').replace('VAC', ''));
        return isNaN(numericValue) ? 0 : numericValue;
    };

    const sumOhmsForArray = (arr) => {
        console.log("ohms", arr);
        
        let ohmsValues = arr.filter(val => 
            val.includes('ohms') || val.includes('uf') || val.includes('H')
        );
        
        // Process the values based on their type
        const processedValues = ohmsValues.map(val => {
            if (val.includes('ohms')) {
                // For ohms values
                return parseVoltage(val);
            } else if (val.includes('uf') || val.includes('H')) {

                if (val.startsWith('j') && val.length > 4) {
                    const numericPart = val.slice(1, -1);
                    return parseFloat(numericPart);
                } else if (val.startsWith('-j') && val.length > 4) {
                    const numericPart = val.slice(2, -2);
                    return parseFloat(numericPart);
                } else {
                    // For values without j prefix or non-standard format
                    return parseVoltage(val);
                }
            }
            return 0;
        });
        
        return processedValues.length > 0
            ? processedValues.reduce((sum, val) => sum + val, 0)
            : 0;
    };

    // Calculate voltage for the row
    const calculateVoltage = (row) => {
        // Calculate DC and AC voltages
        const dcVoltage = row[0]
            .filter(val => val.includes('VDC'))
            .reduce((sum, val) => sum + parseVoltage(val), 0);

        const acVoltage = row[0]
            .filter(val => val.includes('VAC'))
            .reduce((sum, val) => 
                sum + parseVoltage(val) * Math.sin(alpha), 0);

        return dcVoltage + acVoltage;
    };

    // Convert each row of the results (skipping the first row)
    const outputMatrix = results.slice(1).map(row => {

        const ohmsColumns = row.map(column => sumOhmsForArray(column));
        console.log(ohmsColumns)
        return [...ohmsColumns, calculateVoltage(row)];
    });

    console.log("outpur", outputMatrix)
    return outputMatrix;
}

// // Example usage
// const results = [
//     ['I0', 'I1', 'I2'],
//     [['4VAC', '4Ohms', '4VDC'], ['4VDC'], ['4Ohms']],
//     [['4VAC'], ['4Ohms', '4Ohms', '4VDC'], ['4Ohms']],
//     [['4Ohms'], ['4Ohms'], ['4Ohms', '4VDC', '4Ohms', '4Ohms']]
// ];

// // Calculate matrices for different alpha points
// const alphaPoints = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
// const alphaSeriesMatrices = alphaPoints.map(alpha => 
//     Discrete(results, alpha)
// );

// // Print the alpha series matrices
// alphaPoints.forEach((alpha, index) => {
//     console.log(`alpha ${alpha.toFixed(2)}:`);
//     console.log(alphaSeriesMatrices[index]);
//     console.log();
// });