import EventEmitter from './event-emitter'

export default class PluginBase extends EventEmitter {
    constructor(app) {
        super()
        this.app = app
        app.on('ready', this.ready)
    }

    ready() {

    }
}
