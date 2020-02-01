/* eslint-disable no-console */
import EventEmitter from '../lib/classes/event-emitter'

export class Board extends EventEmitter {
    constructor(dom, id) {
        super()

        this.on('freeze',
            () => {
                console.debug('Board frozen.')
                dom.addClass('kanban-frozen')
            }
        ).on('unfreeze',
            () => {
                console.debug('Board unfrozen.')
                dom.removeClass('kanban-frozen')
            }
        )

        this.emit('freeze')

        const socket = new WebSocket(
            `ws://${window.location.host}/ws/kanban/${id}/`
        )

        socket.onclose = () => {
            console.warn('Kanban board socket closed unexpectedly.')
            this.emit('error')
            this.emit('freeze')
        }

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data)

            console.debug('Kanban socket message', data)
        }

        socket.onopen = () => {
            console.debug('Opened a socket to the Kanban board.')
            socket.send()
        }
    }
}
