/* eslint-disable no-console */

import ViewBase from '../../lib/classes/view'
import Database from '../../lib/classes/database'
import EventEmitter from '../../lib/classes/event-emitter'
import toast from '../../lib/helpers/toast'

class Task extends EventEmitter {
    constructor(db, settings) {
        super()
        this.id = settings.id
        this.mark = (complete) => {
            console.debug(
                `Marking task ${this.id} as`, complete ? 'complete' : 'incomplete'
            )

            this.emit('marking')
            db.update(
                {
                    type: 'tasks',
                    id: settings.id,
                    attributes: {
                        completed: complete
                    }
                }
            )
        }

        db.on('updated',
            (type, data) => {
                if (type === 'tasks') {
                    if (data.id === settings.id) {
                        this.emit('marked')
                        console.debug(
                            `Task ${data.id} as`, data.attributes.completed ? 'complete' : 'incomplete'
                        )
                    }
                }
            }
        )
    }
}

export default class DeliverableDetailView extends ViewBase {
    classNames() {
        return ['projects', 'deliverable-detail']
    }

    ready() {
        const $ = window.$
        const db = new Database(
            `ws://${window.location.host}/ws/tasks/`
        )

        const checkboxes = $('input[data-name="tasks"]')

        checkboxes.each(
            function() {
                const input = $(this)
                const id = parseInt(input.attr('value'))
                const task = new Task(
                    db,
                    {
                        id: id
                    }
                )

                task.on('marking',
                    () => {
                        input.data(
                            'frozen',
                            true
                        ).attr(
                            'disabled',
                            'disabled'
                        )
                    }
                ).on('marked',
                    () => {
                        input.data(
                            'frozen',
                            false
                        ).removeAttr(
                            'disabled'
                        )
                    }
                )

                input.data('task', task)
            }
        ).on('input',
            function() {
                const input = $(this)
                const task = input.data('task')
                const checked = input.is(':checked')

                if (input.attr('disabled')) {
                    return false
                }

                task.mark(checked)
            }
        )

        this.on('freeze',
            () => {
                checkboxes.attr('disabled', 'disabled')
            }
        ).on('unfreeze',
            () => {
                checkboxes.each(
                    function() {
                        const input = $(this)

                        if (input.data('frozen')) {
                            return
                        }

                        input.removeAttr('disabled')
                    }
                )
            }
        )

        let disconnected = false

        db.on('connected',
            () => {
                this.emit('unfreeze')

                if (disconnected) {
                    disconnected = false
                    toast.success('Re-established connection with the server.')
                }
            }
        ).on('disconnected',
            () => {
                this.emit('error')
                this.emit('freeze')
                disconnected = true
                toast.error('Lost connection to the server.')
            }
        )

        this.emit('freeze')
        db.connect()
    }
}
