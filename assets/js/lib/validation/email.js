/* global Promise */

import ValidatorBase from '../classes/validator'

const REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default class EmailValidator extends ValidatorBase {
    validate(email) {
        return new Promise(
            (resolve, reject) => {
                const str = String(email).toLowerCase()

                if (!REGEX.test(str)) {
                    reject(new Error('This doesn\'t look like an email address.'))
                } else {
                    resolve(str)
                }
            }
        )
    }
}
