/* global Promise */
import EventEmitter from '../lib/classes/event-emitter'

const $ = window.$
class CardBase extends EventEmitter {
    constructor() {
        super()

        this.actions = {}
        this.attach = (dom) => {
            const container = $('<div>').addClass(
                'kanban-card card mb-3'
            )

            const body = $('<div>').addClass('card-body')

            container.append(body)
            dom.append(container)
            this.populate(body)

            if (Object.keys(this.actions).length) {
                const footer = $('<div>').addClass(
                    'card-footer text-right'
                )

                Object.keys(this.actions).forEach(
                    (key) => {
                        const action = this.actions[key]
                        const a = $('<a>').attr('href', 'javascript:;')
                        const icon = $('<i>').addClass(
                            `fa fa-${action.icon || key}`
                        )

                        a.on('click',
                            (e) => {
                                e.preventDefault()
                                action.perform().catch(
                                    (err) => {
                                        console.warn('Error performing', key, err)
                                    }
                                )
                            }
                        )

                        a.addClass('text-muted')
                        a.append(icon)
                        footer.append(a)
                    }
                )

                container.append(footer)
            }

            this.detatch = () => {
                container.remove()

                this.detatch = () => {
                    throw new Error('Card has not been attached to a DOM element.')
                }

                this.freeze = () => {
                    throw new Error('Card has not been attached to a DOM element.')
                }

                this.unfreeze = () => {
                    throw new Error('Card has not been attached to a DOM element.')
                }

                this.emit('detatched')
            }

            this.freeze = () => {
                container.addClass('kanban-frozen')
            }

            this.unfreeze = () => {
                container.removeClass('kanban-frozen')
            }

            this.emit('attached')
            return container
        }

        this.populate = () => {

        }

        this.cancel = () => {
            this.emit('cancelled')
        }

        this.submit = (value) => {
            this.emit('submitted', value)
        }

        this.detatch = () => {
            throw new Error('Card has not been attached to a DOM element.')
        }

        this.freeze = () => {
            throw new Error('Card has not been attached to a DOM element.')
        }

        this.unfreeze = () => {
            throw new Error('Card has not been attached to a DOM element.')
        }
    }
}

export class TemporaryCard extends CardBase {
    constructor(settings) {
        super(settings)

        this.populate = (body) => {
            const input = $('<input>').attr(
                'type', 'text'
            ).addClass(
                'form-control'
            )

            if (settings.placeholder) {
                input.attr('placeholder', settings.placeholder)
            }

            input.on('keyup',
                (e) => {
                    switch (e.keyCode) {
                        case 27:
                            this.cancel()
                            break

                        case 13:
                            e.preventDefault()
                            this.submit(input.val())
                            break
                    }
                }
            )

            body.append(input)
            input.focus()
        }
    }
}

export class Card extends CardBase {
    constructor(settings) {
        super(settings)
        this.id = settings.id
        this.ordering = settings.ordering

        this.actions = {
            delete: {
                icon: 'trash',
                title: 'Delete card',
                perform: () => new Promise(
                    (resolve, reject) => {
                        if (confirm('Are you sure?')) {
                            this.destroy().then(
                                () => {
                                    resolve(true)
                                }
                            ).catch(
                                (err) => {
                                    reject(err)
                                }
                            )
                        } else {
                            resolve(false)
                        }
                    }
                )
            }
        }

        this.populate = (body) => {
            const title = $('<a>').attr(
                'href', settings.url
            ).text(
                settings.name
            )

            body.append(title)
        }

        this.destroy = () => new Promise(
            (resolve) => {
                this.emit('destroy', resolve)
            }
        )

        this.move = (from, to) => {
            this.freeze()
            this.emit('send', from, to)
        }

        this.update = (newSettings) => {
            settings = newSettings
            this.ordering = newSettings.ordering
            this.name = newSettings.name
        }
    }
}
