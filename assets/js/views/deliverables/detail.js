import ViewBase from '../../lib/classes/view'
import Database from '../../lib/classes/database'
import EventEmitter from '../../lib/classes/event-emitter'
import Task from '../../models/tasks'
import toast from '../../lib/helpers/toast'

class TaskList extends EventEmitter {
    constructor(dom) {
        const idParts = dom.data('id').split('/')
        const projectID = idParts[0]
        const deliverableID = idParts[1]
        const url = `ws://${window.location.host}/ws/projects/${projectID}/deliverables/${deliverableID}/tasks/`
        const db = new Database(url)
        const $ = window.$
        const body = dom.find('.card-body')
        let disconnected = false
        let tasksByID = {}

        super()
        this.on('freeze',
            () => {
                body.find(':input').attr('disabled', 'disabled')
            }
        ).on('unfreeze',
            () => {
                body.find(':input').each(
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

        db.on('listed',
            (type, data) => {
                if (type === 'tasks') {
                    body.html('')

                    data.forEach(
                        (settings) => {
                            const attrs = $.extend(
                                {
                                    id: settings.id
                                },
                                settings.attributes
                            )

                            const task = new Task(attrs).on(
                                'mark',
                                (complete) => {
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
                            )

                            tasksByID[settings.id] = task
                            task.attach(body)
                        }
                    )
                }
            }
        ).on('updated',
            (type, data) => {
                if (type === 'tasks') {
                    const task = tasksByID[data.id]

                    if (typeof (task) === 'undefined') {
                        console.warn(`Task ${data.id} not found.`)
                        return
                    }

                    task.update(data.attributes)
                    task.emit('unfreeze')
                }
            }
        ).on('connected',
            () => {
                db.list(
                    {
                        type: 'tasks'
                    }
                )

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

        body.html(
            '<center class="my-5 text-muted">' +
            '    <i class="fa fa-spin fa-spinner fa-2x fa-fw"></i>' +
            '</center>'
        )

        this.emit('freeze')
        db.connect()
    }
}

export default class DeliverableDetailView extends ViewBase {
    classNames() {
        return ['projects', 'deliverable-detail']
    }

    ready() {
        const $ = window.$

        $('.card.tasks[data-id]').each(
            function() {
                const dom = $(this)
                const list = new TaskList(dom)

                dom.data('task-list', list)
            }
        )
    }
}
