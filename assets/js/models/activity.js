import EventEmitter from '../lib/classes/event-emitter'
import moment from 'moment'
import _ from 'escape-html'
const $ = window.$

class ObjectTemplate {
    constructor(obj) {
        this.inner = () => {
            return ''
        }

        this.render = () => {
            const template = `<div class="object ${_(obj.type)}-object">
                ${this.inner()}
            </div>`

            return template
        }
    }
}

class StageTemplate extends ObjectTemplate {
    constructor(obj) {
        super(obj)

        this.inner = () => {
            return `<span class="stage-name" style="color: ${_(obj.attributes.colour)}">
                <i class="fa fa-circle"></i>
                ${_(obj.attributes.name)}
            </span>`
        }
    }
}

class EvidenceTemplate extends ObjectTemplate {
    constructor(obj) {
        super(obj)

        this.inner = () => {
            let template = ''

            if (obj.attributes.media) {
                template += `<a class="btn btn-default btn-sm bg-white" href="${obj.attributes.media}" download>
                    <i class="fa fa-download"></i>
                    Download media
                </a>`
            }

            if (obj.attributes.notes) {
                template += `<div class="notes">
                    ${_(obj.attributes.notes)}
                </div>`
            }

            return template
        }
    }
}

class TaskTemplate extends ObjectTemplate {
    constructor(obj) {
        super(obj)

        this.inner = () => {
            return `${_(obj.attributes.name)}`
        }
    }
}

class ActivityTemplate {
    constructor(context) {
        const title = context.title
        const created = moment(context.created).fromNow()
        const classes = ['inner']
        const creatorNameParts = []

        if (context.creator.attributes.first_name) {
            creatorNameParts.push(
                context.creator.attributes.first_name.trim()
            )
        }

        if (context.creator.attributes.last_name) {
            creatorNameParts.push(
                context.creator.attributes.last_name.trim()
            )
        }

        const creatorName = creatorNameParts.join(' ').trim()
        let inner = ''

        if (context.stage) {
            inner = new StageTemplate(context.stage).render()
        } else if (context.evidence) {
            inner = new EvidenceTemplate(context.evidence).render()
        } else if (context.task) {
            inner = new TaskTemplate(context.task).render()
        }

        this.render = () => {
            const template = `
                <div class="${classes.join(' ')}">
                    <span class="title">${_(title)}</span>
                    ${inner}
                </div>
                <small class="text-muted timesince">
                    ${_(created)}, by
                    <a href="javascirpt:;">${_(creatorName)}</a>
                </small>
            `

            return template
        }
    }
}

export default class Activity extends EventEmitter {
    constructor(settings) {
        super()
        this.id = settings.id
        this.attach = (dom, animated) => {
            const container = $('<div>').addClass('activity')
            const render = () => {
                const template = new ActivityTemplate(settings)
                const html = template.render()

                container.html(html)

                if (settings.read) {
                    container.addClass('read')
                } else {
                    container.addClass('unread')
                }

                if (settings.creator.attributes.me) {
                    container.addClass('mine')
                } else {
                    container.addClass('else')
                }

                container.addClass(`activity-${settings.kind}`)
            }

            this.on('render', render)
            render()
            dom.prepend(container)

            if (animated) {
                container.addClass('created')
            }
        }

        this.update = (attrs) => {
            const newSettings = $.extend(
                {
                    id: settings.id
                },
                attrs
            )

            settings = newSettings
            this.on('render')
        }
    }
}
