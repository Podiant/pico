import EventEmitter from '../lib/classes/event-emitter'
import uniqid from '../lib/helpers/uniqid'

export default class EvidenceRequest extends EventEmitter {
    constructor(settings) {
        super()

        if (typeof (settings) === 'object' && settings !== null) {
            Object.keys(settings).forEach(
                (key) => {
                    this[key] = settings[key]
                }
            )
        }

        this.fulfilled = false
        this.cancelled = false
        this.evidence = null
        this.id = uniqid()
    }

    fulfil(evidence) {
        if (!this.fulfilled && !this.cancelled) {
            this.evidence = evidence
            this.fulfilled = true
            this.emit('fulfilled', evidence)
        } else {
            throw new Error(`Request ${this.id} is in an invalid state.`)
        }
    }

    cancel() {
        if (!this.fulfilled && !this.cancelled) {
            this.cancelled = true
            this.emit('cancelled')
        } else {
            throw new Error(`Request ${this.id} is in an invalid state.`)
        }
    }
}
