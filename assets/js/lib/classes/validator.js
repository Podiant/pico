/* global Promise */

import EventEmitter from './event-emitter'

export default class ValidatorBase extends EventEmitter {
    check(value) {
        return new Promise(
            (resolve, reject) => {
                this.emit('validating')
                this.validate(value).then(
                    (valid) => {
                        this.emit('valid')
                        resolve(valid)
                    }
                ).catch(
                    (err) => {
                        this.emit('invalid', err)
                        reject(err)
                    }
                )
            }
        )
    }

    validate() {
        throw new Error('Method not implemented')
    }
}
