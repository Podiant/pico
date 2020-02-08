const uniqid = () => {
    const unix = Date.now() / 1000
    let hex = unix.toString(16).split('.').join('')

    while(hex.length < 14){
        hex += '0'
    }

    return hex
}

export default uniqid
