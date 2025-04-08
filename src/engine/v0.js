import { analyzeCircuit } from "./nodalv2";

export const findJunctionsPromise = new Promise((resolve) => {
    const junctions = findJunctions(selection);
    console.log("junctions", junctions)
    resolve(junctions);
  });

  findJunctionsPromise
    .then(junctions => {
      const loops = findCircuitCycles(junctions);
      return { junctions, loops };
    })
    .then(({ junctions, loops }) => {
      const {matrix, cmap} = analyzeCircuit(junctions, loops);
      return {matrix, cmap}
    })
    .then(({matrix, cmap}) => {
      let alpha = 90 // peak current, voltage.
      let discreteGaussianMatrix = Discrete(matrix, alpha)
      return {discreteGaussianMatrix, cmap}
    })
    .then(({discreteGaussianMatrix, cmap}) => {
      let currents = gaussian(discreteGaussianMatrix)
      return ({currents, cmap})
    })
    .then (({currents, cmap}) => {

      let currentValue = 0
      let peakVoltageRegister = []

      for (let c in cmap) {
        if (cmap[c].loopIndex.length < 2) {
          let thisCurrent = cmap[c].loopIndex[0]
          currentValue = currents[thisCurrent]
        } else {
          let firstCurrent = cmap[c].loopIndex[0]
          let secondCurrent = cmap[c].loopIndex[1]
          currentValue = currents[firstCurrent] - currents[secondCurrent]
        }

        let peakVoltage = cmap[c].details.info && (currentValue * getIntVal(cmap[c].details.info))

        peakVoltageRegister.push({vmax: peakVoltage, imax: currentValue, impedance: cmap[c].value, comp: cmap[c].details.comp})
      }

      console.log("pvr", peakVoltageRegister)

      return ({peakVoltageRegister})
    })