import EventEmitter from '../lib/classes/event-emitter'

export default class CardCreationRequest extends EventEmitter {
    constructor(settings) {
        super()

        if (typeof (settings) === 'object' && settings !== null) {
            Object.keys(settings).forEach(
                (key) => {
                    this[key] = settings[key]
                }
            )
        }

        this.accepted = false
        this.rejected = false
        this.cancelled = false

        const timer = setTimeout(
            () => {
                this.cancel()
            },
            10000
        )

        this.on('accepted', () => { clearTimeout(timer) })
        this.on('rejected', () => { clearTimeout(timer) })
    }

    accept(info) {
        if (!this.accepted && !this.rejected && !this.cancelled) {
            this.accepted = true
            this.emit('accepted', info)
        } else {
            throw new Error('Request is in an invalid state.')
        }
    }

    reject() {
        if (!this.accepted && !this.rejected && !this.cancelled) {
            this.rejected = true
            this.emit('rejected')
        } else {
            throw new Error('Request is in an invalid state.')
        }
    }

    cancel() {
        if (!this.accepted && !this.rejected && !this.cancelled) {
            this.cancelled = true
            this.emit('cancelled')
        } else {
            throw new Error('Request is in an invalid state.')
        }
    }
}
