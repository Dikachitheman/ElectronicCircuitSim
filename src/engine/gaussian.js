
const matrix = [ // x=-8, y=17, z=20
    // ['x', 'y', 'z', 'out'],
    [26, 2, 2, 12.6],
    [3, 27, 1, -14.3],
    [2, 3, 17, 6]
  ]

function gaussSiedel(out, current, a, a_coef, b, b_coef) {

    let a_prod = a * a_coef
    let b_prod = b * b_coef

    let gs = (1 / current) * (out - (a_prod + b_prod))

    return gs
}

function MSELoss(out, pred) {
    let diff = out - pred
    return Math.abs(diff)
}

function iterate (x, y, z) {
    
    let x_coef = matrix[0][0]
    let y_coef = matrix[0][1]
    let z_coef = matrix[0][2]
    let out = matrix[0][3]

    let x1_coef = matrix[1][0]
    let y1_coef = matrix[1][1]
    let z1_coef = matrix[1][2]
    let out1 = matrix[1][3]

    let x2_coef = matrix[2][0]
    let y2_coef = matrix[2][1]
    let z2_coef = matrix[2][2]
    let out2 = matrix[2][3]

    x = gaussSiedel(out, x_coef, y, y_coef, z, z_coef) 
    console.log(x)

    y = gaussSiedel(out1, y1_coef, x, x1_coef, z, z1_coef)
    console.log(y)

    z = gaussSiedel(out2, z2_coef, x, x2_coef, y, y2_coef)
    console.log(z)

    console.log(";;;;;;;;;;")
    return {x, y, z}
}

function gaussian() {

    let x = 0
    let y = 0
    let z = 0

    let loss = 0
    let lossSum = 0

    for (let i = 0; i < 4; i++) {

        const result = iterate(x, y, z)
    
        let x_coef = matrix[0][0]
        let y_coef = matrix[0][1]
        let z_coef = matrix[0][2]
        let out = matrix[0][3]
    
        let x1_coef = matrix[1][0]
        let y1_coef = matrix[1][1]
        let z1_coef = matrix[1][2]
        let out1 = matrix[1][3]
    
        let x2_coef = matrix[2][0]
        let y2_coef = matrix[2][1]
        let z2_coef = matrix[2][2]
        let out2 = matrix[2][3]

        x = result.x
        y = result.y
        z = result.z

        console.log ("x, y, z ", x, y, z)
    
        let pred = ( x_coef * x) + (y_coef * y) + (z_coef * z)
        loss = MSELoss(out, pred)
        lossSum = lossSum + loss
        console.log("out, pred, loss",out, pred, loss)
        pred = 0
        loss = 0
    
        pred = ( x1_coef * x) + (y1_coef * y) + (z1_coef * z)
        loss = MSELoss(out1, pred)
        lossSum = lossSum + loss
        console.log("(out1, pred, loss", out1, pred, loss)
        pred = 0 
        loss = 0

    
        pred = ( x2_coef * x) + (y2_coef * y) + (z2_coef * z)
        loss = MSELoss(out2, pred)
        lossSum = lossSum + loss
        console.log("out2, pred, loss", out2, pred, loss)
        pred = 0
        loss = 0

    
        console.log("estimated loss", lossSum / 3) // estimated loss
        lossSum = 0
    }
}

gaussian()