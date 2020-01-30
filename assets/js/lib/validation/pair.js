/* global Promise */

import ValidatorBase from '../classes/validator'

export default class PairlValidator extends ValidatorBase {
    constructor(value) {
        super()
        this.checkAgainst = value
    }

    validate(value) {
        return new Promise(
            (resolve, reject) => {
                if (value !== this.checkAgainst) {
                    reject(new Error('This value doesn\'t match the previous one.'))
                } else {
                    resolve(value)
                }
            }
        )
    }
}
