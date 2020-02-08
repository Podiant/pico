import EventEmitter from '../lib/classes/event-emitter'

class EvidenceCategory {
    constructor(settings) {
        this.id = settings.id
        this.name = settings.name
    }
}

export default class Task extends EventEmitter {
    constructor(settings) {
        const $ = window.$

        super()
        this.id = settings.id

        if (settings.evidence && settings.evidence.categories) {
            this.evidence_categories = settings.evidence.categories.map(
                (cat) => new EvidenceCategory(
                    $.extend(
                        {
                            id: cat.id
                        },
                        cat.attributes
                    )
                )
            )
        } else {
            this.evidence_categories = []
        }

        this.attach = (dom) => {
            const container = $('<div>').addClass(
                'task'
            ).addClass(
                'mb-3'
            )

            let checked = false
            let frozen = false

            const label = $('<span>').text(
                settings.name
            ).addClass('label')

            container.on('click',
                () => {
                    if (frozen) {
                        return
                    }

                    if (checked) {
                        this.emit('mark', false)
                        return
                    }

                    switch (settings.evidence.direction) {
                        case 'up':
                            this.emit('evidence.require')
                            break

                        case 'download':
                            this.emit('evidence.retrieve')
                            break

                        default:
                            this.emit('mark', true)
                    }
                }
            )

            const update = () => {
                checked = settings.completed

                if (checked) {
                    container.addClass('completed')
                } else {
                    container.removeClass('completed')
                }
            }

            container.append(label)
            container.data('task', this)
            dom.append(container)

            this.on('freeze',
                () => {
                    frozen = true
                    container.addClass('frozen')
                }
            ).on('unfreeze',
                () => {
                    frozen = false
                    container.removeClass('frozen')
                }
            ).on('updated',
                () => {
                    update()
                }
            )

            update()
        }

        this.update = (newSettings) => {
            settings = $.extend(
                {
                    id: settings.id
                },
                newSettings
            )

            this.emit('updated')
        }

        this.on('mark',
            () => {
                this.emit('freeze')
            }
        )
    }
}
