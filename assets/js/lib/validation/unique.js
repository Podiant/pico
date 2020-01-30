/* global Promise */

import ValidatorBase from '../classes/validator'

export default class UniqueValidator extends ValidatorBase {
    constructor(basis) {
        super()
        this.basis = basis
    }

    validate(value) {
        return new Promise(
            (resolve, reject) => {
                const socket = new WebSocket(
                    `ws://${window.location.host}/ws/unique/${this.basis}/`
                )

                let resolved = false
                let rejected = false

                socket.onclose = () => {
                    if (!rejected && !resolved) {
                        reject(
                            new Error('An error occurred while communicating with the server.')
                        )
                    }
                }

                socket.onmessage = (e) => {
                    const data = JSON.parse(e.data)

                    if (data.valid) {
                        if (!rejected && !resolved) {
                            resolved = true
                            socket.close()
                            resolve(value)
                        }
                    } else if (!rejected && !resolved) {
                        rejected = true
                        socket.close()
                        reject(new Error(data.error))
                    }
                }

                socket.onopen = () => {
                    socket.send(value)
                }
            }
        )
    }
}
