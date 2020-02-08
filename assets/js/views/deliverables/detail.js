import ViewBase from '../../lib/classes/view'
import Database from '../../lib/classes/database'
import EventEmitter from '../../lib/classes/event-emitter'
import Task from '../../models/tasks'
import EvidenceRequest from '../../models/evidence-requests'
import toast from '../../lib/helpers/toast'

const $ = window.$

class TaskList extends EventEmitter {
    constructor(dom) {
        const idParts = dom.data('id').split('/')
        const projectID = idParts[0]
        const deliverableID = idParts[1]
        const url = `ws://${window.location.host}/ws/projects/${projectID}/deliverables/${deliverableID}/`
        const db = new Database(url)
        const $ = window.$
        const body = dom.find('.card-body')
        let disconnected = false
        let tasksByID = {}
        let updating = false

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

        db.on('updated',
            (type) => {
                if (type === 'deliverables') {
                    body.animate(
                        {
                            opacity: 0
                        },
                        333,
                        () => {
                            db.list(
                                {
                                    type: 'tasks'
                                }
                            )
                        }
                    )

                    updating = true
                }
            }
        ).on('listed',
            (type, data) => {
                if (type === 'tasks') {
                    body.html('')
                    let added = false

                    data.forEach(
                        (settings) => {
                            const attrs = $.extend(
                                {
                                    id: settings.id
                                },
                                settings.attributes
                            )

                            const task = new Task(attrs)

                            task.on('evidence.require',
                                () => {
                                    const request = new EvidenceRequest(
                                        {
                                            task: task
                                        }
                                    )

                                    request.on('fulfilled',
                                        (evidence) => {
                                            db.update(
                                                {
                                                    type: 'tasks',
                                                    id: settings.id,
                                                    attributes: {
                                                        completed: true,
                                                        evidence: evidence
                                                    }
                                                }
                                            )
                                        }
                                    ).on('cancelled',
                                        () => {
                                            toast.warning(
                                                'You need to submit evidence to complete this task.'
                                            )
                                        }
                                    )

                                    this.emit('evidence.required', request)
                                }
                            ).on(
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
                            added = true
                        }
                    )

                    if (!added) {
                        body.html(
                            '<center>' +
                            '<span class="h1 m-0">☕️</span><br>' +
                            'There&rsquo;s nothing more for you to do here!' +
                            '</center>'
                        )
                    }

                    if (updating) {
                        body.animate(
                            {
                                opacity: 1
                            },
                            333
                        )
                    }
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

class StageTimeline extends EventEmitter {
    constructor(dom) {
        const idParts = dom.data('id').split('/')
        const projectID = idParts[0]
        const deliverableID = idParts[1]
        const url = `ws://${window.location.host}/ws/projects/${projectID}/deliverables/${deliverableID}/`
        const db = new Database(url)
        let updating = false
        const refresh = (obj) => {
            let stageIndex = 0

            dom.find('.timeline-stage').each(
                function(index) {
                    const stage = $(this)
                    const stageID = stage.data('id')

                    if (obj.stage) {
                        if (stageID.toString() === obj.stage.id.toString()) {
                            stage.addClass('active')
                            stageIndex = index
                        } else {
                            stage.removeClass('active')
                        }
                    }

                    stage.removeAttr('data-id')
                }
            )

            dom.find('.timeline-stage').each(
                function(index) {
                    const stage = $(this)
                    const isReady = stage.hasClass('ready')
                    const isPending = stage.hasClass('pending')
                    const timeout = updating ? 10 : (index * 333)
                    let makeReady = false
                    let makePending = false

                    if (index <= stageIndex) {
                        if (!isReady) {
                            stage.addClass('ready')
                            makeReady = true
                        }
                    } else {
                        if (!isPending) {
                            stage.addClass('pending')
                            makePending = true
                        }
                    }

                    if (makeReady) {
                        if (isPending) {
                            stage.removeClass('pending').addClass('changing')
                            stage.delay(timeout).queue(
                                (next) => {
                                    stage.removeClass('changing').addClass('ready')
                                    next()
                                }
                            )
                        } else if (!isReady) {
                            stage.addClass('changing')
                            stage.delay(timeout).queue(
                                (next) => {
                                    stage.removeClass('changing').addClass('ready')
                                    next()
                                }
                            )
                        }
                    } else if(makePending) {
                        if (isReady) {
                            stage.removeClass('ready').addClass('changing')
                            stage.delay(timeout).queue(
                                (next) => {
                                    stage.removeClass('changing').addClass('pending')
                                    next()
                                }
                            )
                        } else if (!isPending) {
                            stage.addClass('changing')
                            stage.delay(timeout).queue(
                                (next) => {
                                    stage.removeClass('changing').addClass('pending')
                                    next()
                                }
                            )
                        }
                    }
                }
            )
        }

        super()

        db.on('connected',
            () => {
                db.get(
                    {
                        type: 'deliverables'
                    }
                )
            }
        ).on('got',
            (type, data) => {
                if (type === 'deliverables') {
                    refresh(data.attributes)
                }
            }
        ).on('updated',
            (type, data) => {
                if (type === 'deliverables') {
                    updating = true
                    refresh(data.attributes)
                }
            }
        )

        db.connect()
    }
}

class EvidenceModal extends EventEmitter {
    constructor(dom, settings) {
        super()

        if (typeof (settings) === 'undefined') {
            settings = {}
        }

        const media = dom.find(':input[data-name="media"]')
        const dropzone = media.closest('.dropzone').data('dropzone')
        const notes = dom.find(':input[data-name="text"]')
        const category = dom.find(':input[data-name="category"]')
        const btn = dom.find('[data-action="evidence.submit"]')

        const cleanup = () => {
            dom.off('hidden.bs.modal', hide)
            dom.off('shown.bs.tab', switchTabs)
            btn.off('click', submit)
            media.off('change', validate)
            notes.off('input', validate)
            category.off('input', validate)
            dropzone.off('progress', progress)
            dropzone.off('complete', uploaded)
        }

        const hide = () => {
            cleanup()

            if (!this.evidence) {
                this.emit('cancelled')
            } else {
                this.emit('submitted', this.evidence)
            }
        }

        const progress = (percent) => {
            const footer = dom.find('.modal-footer')
            const progress = footer.find('.progress')
            const bar = progress.find('.progress-bar')

            bar.css('width', Math.round(percent) + '%')
        }

        const uploaded = (data) => {
            this.evidence = {
                notes: notes.val(),
                media: data,
                category: category.val()
            }

            dom.modal('hide')
        }

        const submit = (e) => {
            e.preventDefault()

            if (btn.attr('disabled')) {
                return
            }

            this.emit('submitting')
            dropzone.submit('evidence/')
        }

        const validate = () => {
            const files = media.get(0).files

            if (files.length || notes.val()) {
                if (category.get(0).selectedIndex > -1) {
                    this.emit('unfreeze')
                }
            } else {
                this.emit('freeze')
            }
        }

        const switchTabs = () => {
            const activeTab = dom.find('.tab-pane.active')

            if (activeTab.attr('id') == 'evidence-request-text') {
                notes.focus()
            }
        }

        this.on('freeze',
            () => {
                btn.attr('disabled', 'disabled')
            }
        ).on('unfreeze',
            () => {
                btn.removeAttr('disabled')
            }
        ).on('submitting',
            () => {
                const footer = dom.find('.modal-footer')
                const controls = footer.find('.controls')
                const progress = footer.find('.progress')

                controls.addClass('hidden')
                progress.find('.progress-bar').addClass('progress-bar-animated')
                progress.removeClass('hidden')

                this.submitting = true
            }
        )

        dom.on('hidden.bs.modal', hide)
        dom.on('shown.bs.tab', switchTabs)
        btn.on('click', submit)

        this.evidence = null
        this.submitting = false
        this.show = () => {
            dom.modal('show')
        }

        media.on('change', validate)
        notes.on('input', validate)
        category.on('input', validate)
        dropzone.on('progress', progress)
        dropzone.on('complete', uploaded)

        media.val('')
        btn.attr('disabled', 'disabled')

        dom.find('.modal-footer .controls').removeClass('hidden')
        dom.find('.modal-footer .progress .progress-bar').removeClass('progress-bar-animated')
        dom.find('.modal-footer .progress').addClass('hidden')

        category.html('')
        if (Array.isArray(settings.evidence_categories)) {
            settings.evidence_categories.forEach(
                (cat) => {
                    const option = $('<option>').attr(
                        'value',
                        cat.id
                    ).text(
                        cat.name
                    )

                    category.append(option)
                }
            )

            if (settings.evidence_categories.length) {
                category.get(0).selectedIndex = 0
            } else {
                try {
                    category.get(0).selectedIndex = -1
                } catch (err) {
                    console.warn(err)
                }
            }
        }
    }
}

export default class DeliverableDetailView extends ViewBase {
    classNames() {
        return ['projects', 'deliverable-detail']
    }

    ready() {
        $('.stage-timeline[data-id]').each(
            function() {
                const dom = $(this)
                const timeline = new StageTimeline(dom)

                dom.data('timeline', timeline)
            }
        )

        $('.card.tasks[data-id]').each(
            function() {
                const dom = $(this)
                const list = new TaskList(dom)

                list.on('evidence.required',
                    (request) => {
                        const modal = new EvidenceModal(
                            $('#evidence-request'),
                            {
                                evidence_categories: request.task.evidence_categories
                            }
                        )

                        modal.on('cancelled',
                            () => {
                                request.cancel()
                            }
                        ).on('submitted',
                            (evidence) => {
                                request.fulfil(evidence)
                            }
                        )

                        modal.show()
                    }
                )

                dom.data('task-list', list)
            }
        )
    }
}
