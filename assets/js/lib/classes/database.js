import EventEmitter from './event-emitter'

export default class Database extends EventEmitter {
    constructor(uri, reconnectTime) {
        let socket = null
        let reconnectTimeout = null
        let connected = false

        super()
        this.connect = () => {
            socket = new WebSocket(uri)

            const method = (name, data, meta) => {
                const unserialised = {
                    meta: window.$.extend(
                        {
                            method: name
                        },
                        meta
                    ),
                    data: data
                }

                const json = JSON.stringify(unserialised)

                socket.send(json)
            }

            this.create = (data) => method('create', data)
            this.update = (data) => method('update', data)
            this.update_list = (type, data) => method('update_list', data, {type: type})
            this.delete = (data) => method('delete', data)
            this.list = (data) => method('list', data)

            socket.onclose = () => {
                socket = null
                reset()

                if (connected) {
                    connected = false
                    this.emit('disconnected')
                }

                reconnectTimeout = setTimeout(
                    () => {
                        reconnectTime *= 2
                        this.connect()
                    },
                    reconnectTime
                )

                console.warn(
                    `Waiting ${reconnectTime / 1000} second(s) for connection to be restored.`
                )
            }

            socket.onmessage = (e) => {
                const unserialised = JSON.parse(e.data)

                if (unserialised.error) {
                    console.warn(unserialised.error)
                    return
                }

                if (!unserialised.meta) {
                    console.warn('Missing response metadata.')
                    return
                }

                switch (unserialised.meta.method) {
                    case 'list':
                        this.emit('listed', unserialised.meta.type, unserialised.data)
                        return

                    case 'create':
                        this.emit('created', unserialised.meta.type, unserialised.data)
                        return

                    case 'update':
                        this.emit('updated', unserialised.meta.type, unserialised.data)
                        return

                    case 'update_list':
                        this.emit('listed', unserialised.meta.type, unserialised.data)
                        return

                    case 'delete':
                        this.emit('deleted', unserialised.meta.type, unserialised.data)
                        return
                }

                console.warn('Unrecognised response.', unserialised.meta)
            }

            socket.onopen = () => {
                if (reconnectTimeout !== null) {
                    clearTimeout(reconnectTimeout)
                    reconnectTimeout = null
                }

                if (!connected) {
                    connected = true
                    this.emit('connected')
                }
            }
        }

        const reset = () => {
            if (typeof (reconnectTime) === 'undefined') {
                reconnectTime = 1000
            }

            this.create = () => {
                throw new Error('Database not connected.')
            }

            this.update = () => {
                throw new Error('Database not connected.')
            }

            this.update_list = () => {
                throw new Error('Database not connected.')
            }

            this.delete = () => {
                throw new Error('Database not connected.')
            }

            this.list = () => {
                throw new Error('Database not connected.')
            }

            this.send = () => {
                throw new Error('Database not connected.')
            }
        }

        reset()
    }
}
