import EventEmitter from './event-emitter'

export default class App extends EventEmitter {
    constructor({plugins}) {
        super()
        this.__plugins = []

        if (Array.isArray(plugins)) {
            plugins.forEach(
                (Plugin) => {
                    const plugin = new Plugin(this)

                    this.__plugins.push(plugin)
                }
            )
        }

        this.$ = window.$
        this.$(document).ready(
            () => {
                this.ready()
            }
        )
    }

    ready() {
        this.emit('ready')
    }
}
