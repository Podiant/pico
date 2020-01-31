import EventEmitter from './event-emitter'

export default class App extends EventEmitter {
    constructor({plugins, views}) {
        super()
        this.__plugins = []
        this.__views = []

        if (Array.isArray(plugins)) {
            plugins.forEach(
                (Plugin) => {
                    const plugin = new Plugin(this)

                    this.__plugins.push(plugin)
                }
            )
        }

        if (Array.isArray(views)) {
            views.forEach(
                (View) => {
                    const view = new View(this)

                    this.__views.push(view)
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
        const body = this.$('body')

        this.__views.forEach(
            (view) => {
                const classes = view.classNames()
                let mismatch = false

                classes.forEach(
                    (cls) => {
                        if (mismatch) {
                            return
                        }

                        if (!body.hasClass(cls)) {
                            mismatch = true
                        }
                    }
                )

                if (!mismatch) {
                    view.ready()
                }
            }
        )

        this.emit('ready')
    }
}
