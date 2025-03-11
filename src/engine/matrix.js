
// GRADIENT DESCENT -> EXPERIMENT

const matrix = [ // x=-8, y=17, z=20
    // ['x', 'y', 'z', 'out'],
    [4, 3, 8, 179],
    [-8, 31, 2, 631],
    [5, 7, 10, 279]
  ]

function getProduct(val, coef) {
    return val * coef
}

function MSELoss(out, pred) {
    let diff = out - pred
    return Math.abs(diff)
}

function estimatedLoss(i, j, k) {
    return ( i + j + k ) / 3
}

function experiment(x, y, z, alpha, equation, pred, loss, estimated_loss, v, derivative) {

    let tau = equation[v]
    let rand = () => (Math.floor((Math.random() * 100) + 1));
    let rand_val = rand()

    for ( let i = 0; i < 4; i++) {
        let tau_forward = tau + rand_val
        console.log("tau", tau, "forward", tau_forward, "rand", rand_val)

        equation.splice(v, 1, tau_forward)

        let x_coef = equation[0]
        let y_coef = equation[1]
        let z_coef = equation[2]

        let out_val = equation[3]

        let x_val = getProduct(x, x_coef)
        let y_val = getProduct(y, y_coef)
        let z_val = getProduct(z, z_coef)

        let pred = x_val + y_val + z_val

        let loss_prime = MSELoss(out_val, pred)

        let loss_diff = loss - loss_prime

        console.log("loss moving variable", v, "value", equation[v], loss, loss_prime, "loss diff", loss_diff)
    }

}

function gradientDescent() {
    let x = 1
    let y = 1
    let z = 1

    let loss = 0
    let x_derivative = null // d_loss / d_x
    let y_derivative = null
    let z_derivative = null
    let out_derivative = null

    let lossSum = 0
    let estimated_loss

    let ratio = null
    let moving_average = 0
    let advantage = 0

    let delta_loss = 0
    let delta_x = 0
    let delta_y = 0
    let delta_z = 0

    let x_prev = x
    let y_prev = y
    let z_prev = z
    let loss_prev = loss

    let x_alpha = 10
    let y_alpha = -10
    let z_alpha = 10

    let epoch = 4

    for (let i = 0; i < epoch; i++) {

        console.log(`Epoch ${i + 1}`);

        for (let mat in matrix) {

            let x_coef = matrix[mat][0]
            let y_coef = matrix[mat][1]
            let z_coef = matrix[mat][2]
    
            let out_val = matrix[mat][3]
    
            console.log(mat)
            console.log(x, y, z)
            console.log("coef", x_coef, y_coef, z_coef, out_val)
    
            let x_val = getProduct(x, x_coef)
            let y_val = getProduct(y, y_coef)
            let z_val = getProduct(z, z_coef)
    
            let pred = x_val + y_val + z_val
    
            loss = MSELoss(out_val, pred)
            lossSum = lossSum + loss
    
            console.log("val", x_val, y_val, z_val, "pred", pred, "loss", loss)
            
            delta_x = Math.abs(x - x_prev)
            delta_y = Math.abs(y - y_prev)
            delta_z = Math.abs(z - z_prev)

            delta_loss = loss_prev - loss

            x_derivative = delta_loss / delta_x
            y_derivative = delta_loss / delta_y
            z_derivative = delta_loss / delta_z

            console.log("delta loss", delta_loss, "xyz derivative", x_derivative, y_derivative, z_derivative)

            experiment(x, y, z, x_alpha, matrix[mat], pred, loss, estimated_loss, 0, x_derivative)

            x_prev = x
            y_prev = y
            z_prev = z
    
            x = x + x_alpha
            y = y + y_alpha
            z = z + z_alpha

        }
        
        console.log(lossSum / 3) // estimated loss
        estimated_loss = lossSum / 3

    }
}

gradientDescent(matrix)