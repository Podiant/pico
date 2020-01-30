import EventEmitter from './event-emitter'

export default class PluginBase extends EventEmitter {
    constructor(app) {
        super()
        app.on('ready', this.ready)
    }

    ready() {

    }
}
