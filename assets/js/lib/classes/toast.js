import EventEmitter from 'event-emitter'

const $ = window.$

class Icon {
    constructor(type) {
        this.attach = (dom) => {
            const colours = {
                info: '#17a2b8',
                warning: '#ffc107',
                danger: '#dc3545',
                success: '#28a745'
            }

            let colour = colours[type]

            if (typeof (colour) === 'undefined') {
                colour = colours.info
            }

            const html = '<svg class="rounded mr-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"><rect width="100%" height="100%" fill="' + colour + '"></rect></svg>'
            dom.append(html)
        }
    }
}

export default class Toast extends EventEmitter {
    constructor({type, sender, text}) {
        if (typeof (type) === 'undefined') {
            type = 'info'
        }

        if (typeof (sender) === 'undefined') {
            sender = 'Pico'
        }

        super()
        this.type = type
        this.sender = sender
        this.text = text
        this.show = () => {
            const container = $('<div>').addClass(
                'toast'
            ).attr(
                'role',
                'alert'
            ).attr(
                'ria-live',
                'assertive'
            ).attr(
                'aria-atomic',
                'true'
            ).css(
                {
                    'position': 'fixed',
                    'bottom': '15px',
                    'left': '15px',
                    'min-width': '300px'
                }
            )

            const header = $('<div>').addClass(
                'toast-header'
            )

            const icon = new Icon(this.type)
            const title = $('<strong>').addClass('mr-auto').text(this.sender)
            const time = $('<small>').text('Just now')
            const btn = $('<butotn>').addClass(
                'ml-2 mb-1 close'
            ).attr(
                'data-dismiss',
                'toast'
            ).attr(
                'aria-label',
                'Close'
            ).html(
                '<span aria-hidden="true">&times;</span>'
            ).attr(
                'href',
                'javascript:;'
            )

            icon.attach(header)
            header.append(title)
            header.append(time)
            header.append(btn)
            container.append(header)

            const body = $('<div>').addClass(
                'toast-body'
            )

            body.text(text)
            container.append(body)

            $('body').append(container)
            container.toast(
                {
                    delay: 6000
                }
            ).toast('show')
        }
    }
}
