import EventEmitter from '../lib/classes/event-emitter'

export default class Task extends EventEmitter {
    constructor(settings) {
        const $ = window.$

        super()
        this.id = settings.id
        this.attach = (dom) => {
            const container = $('<div>').addClass('checkbox')
            const label = $('<label>').text(settings.name).attr(
                'for',
                `id_${settings.id}`
            )

            const input = $('<input>').attr(
                'type',
                'checkbox'
            ).attr(
                'id',
                `id_${settings.id}`
            )

            input.on('click',
                (e) => {
                    const complete = input.is(':checked')

                    e.preventDefault()
                    if (!input.attr('disabled')) {
                        this.emit('mark', complete)
                    }

                    return false
                }
            )

            container.append(input)
            container.append('&nbsp;')
            container.append(label)
            container.data('task', this)
            dom.append(container)

            this.on('freeze',
                () => {
                    input.attr('disabled', 'disabled')
                }
            ).on('unfreeze',
                () => {
                    input.removeAttr('disabled')
                }
            ).on('updated',
                () => {
                    if (settings.completed) {
                        input.prop(
                            'checked', 'checked'
                        ).attr(
                            'checked', 'checked'
                        )
                    } else {
                        input.prop(
                            'checked',
                            false
                        ).removeAttr(
                            'checked'
                        )
                    }
                }
            )
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
