const Debouncer = (func, tolerance) => {
    if (typeof (tolerance) === 'undefined') {
        tolerance = 333
    }

    let timer = null
    let bouncedArgs = []
    const unbounced = () => {
        {
            func.apply(func, bouncedArgs)
            timer = null
        }
    }

    const runner = (...args) => {
        bouncedArgs = args

        if (timer === null) {
            timer = setTimeout(unbounced, tolerance)
        }
    }

    return runner
}

export default Debouncer
