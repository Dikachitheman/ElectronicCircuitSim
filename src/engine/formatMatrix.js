function Discrete(results, time) {
    /**
     * Convert results matrix to 4-column matrix
     * 
     * @param {Array} results - Input results matrix
     * @param {number} time - Time value for AC voltage calculations
     * @returns {Array} Converted matrix with 4 columns
     */
    // Parse voltage value from string
    const parseVoltage = (val) => {
        const numericValue = parseFloat(val.replace('VDC', '').replace('VAC', ''));
        return isNaN(numericValue) ? 0 : numericValue;
    };

    // Sum ohms values for a specific array
    const sumOhmsForArray = (arr) => {
        const ohmsValues = arr.filter(val => val.includes('Ohms'));
        return ohmsValues.length > 0 
            ? ohmsValues.reduce((sum, val) => sum + parseVoltage(val), 0)
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
                sum + parseVoltage(val) * Math.sin(time), 0);

        return dcVoltage + acVoltage;
    };

    // Convert each row of the results (skipping the first row)
    const outputMatrix = results.slice(1).map(row => [
        sumOhmsForArray(row[0]),  // First column: Ohms for first array
        sumOhmsForArray(row[1]),  // Second column: Ohms for second array
        sumOhmsForArray(row[2]),  // Third column: Ohms for third array
        calculateVoltage(row)      // Fourth column: Voltage
    ]);

    return outputMatrix;
}

// Example usage
const results = [
    ['I0', 'I1', 'I2'],
    [['4VAC', '4Ohms', '4VDC'], ['4VDC'], ['4Ohms']],
    [['4VAC'], ['4Ohms', '4Ohms', '4VDC'], ['4Ohms']],
    [['4Ohms'], ['4Ohms'], ['4Ohms', '4VDC', '4Ohms', '4Ohms']]
];

// Calculate matrices for different time points
const timePoints = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
const timeSeriesMatrices = timePoints.map(time => 
    Discrete(results, time)
);

// Print the time series matrices
timePoints.forEach((time, index) => {
    console.log(`Time ${time.toFixed(2)}:`);
    console.log(timeSeriesMatrices[index]);
    console.log();
});