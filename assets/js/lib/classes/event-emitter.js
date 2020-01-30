export default class EventEmitter {
    constructor() {
        this.__callbacks = {}
    }

    on(event, callback) {
        if (typeof (this.__callbacks[event]) === 'undefined') {
            this.__callbacks[event] = []
        }

        this.__callbacks[event].push(callback)
        return this
    }

    off(event, callback) {
        var cbs = this.__callbacks[event]

        if (typeof (cbs) === 'undefined') {
            return this
        }

        var newCallbacks = []

        if (typeof (callback) !== 'undefined') {
            for(var i = 0; i < cbs.length; i ++) {
                if (cbs[i] !== callback) {
                    newCallbacks.push(cbs[i])
                }
            }
        }

        this.__callbacks[event] = newCallbacks
        return this
    }

    emit(event) {
        var cbs = this.__callbacks[event]
        var args = Array.from(arguments).slice(1)

        if (typeof (cbs) !== 'undefined') {
            for(var i = 0; i < cbs.length; i ++) {
                cbs[i].apply(this, args)
            }
        }

        return this
    }
}
