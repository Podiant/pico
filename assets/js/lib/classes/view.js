import EventEmitter from './event-emitter'

export default class ViewBase extends EventEmitter {
    classNames() {
        return []
    }

    constructor(app) {
        super()
        this.app = app
    }

    ready() {

    }
}
