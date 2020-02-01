/* eslint-disable no-console */
/* global Promise */
import EventEmitter from '../lib/classes/event-emitter'

class CardCreationRequest extends EventEmitter {
    constructor(column) {
        super()

        this.accepted = false
        this.rejected = false
        this.cancelled = false

        console.log('Requesting to add a card in', column.name)

        const timer = setTimeout(
            () => {
                this.cancel()
            },
            10000
        )

        this.on('accepted', () => { clearTimeout(timer) })
        this.on('rejected', () => { clearTimeout(timer) })
    }

    accept(info) {
        if (!this.accepted && !this.rejected && !this.cancelled) {
            this.accepted = true
            this.emit('accepted', info)
        } else {
            throw new Error('Request is in an invalid state.')
        }
    }

    reject() {
        if (!this.accepted && !this.rejected && !this.cancelled) {
            this.rejected = true
            this.emit('rejected')
        } else {
            throw new Error('Request is in an invalid state.')
        }
    }

    cancel() {
        if (!this.accepted && !this.rejected && !this.cancelled) {
            this.cancelled = true
            this.emit('cancelled')
        } else {
            throw new Error('Request is in an invalid state.')
        }
    }
}

class CardBase extends EventEmitter {
    constructor() {
        super()

        this.actions = {}
        this.attach = (dom) => {
            const container = window.$('<div>').addClass(
                'kanban-card card mb-3'
            )

            const body = window.$('<div>').addClass('card-body')

            container.append(body)
            dom.append(container)
            this.populate(body)

            if (Object.keys(this.actions).length) {
                const footer = window.$('<div>').addClass(
                    'card-footer text-right'
                )

                Object.keys(this.actions).forEach(
                    (key) => {
                        const action = this.actions[key]
                        const a = window.$('<a>').attr('href', 'javascript:;')
                        const icon = window.$('<i>').addClass(
                            `fa fa-${action.icon || key}`
                        )

                        a.on('click',
                            (e) => {
                                e.preventDefault()
                                action.perform().then(
                                    (result) => {
                                        console.log('Performed', key, result)
                                    }
                                ).catch(
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
                this.emit('detatched')
            }

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
    }
}

class TemporaryCard extends CardBase {
    constructor(settings) {
        super(settings)

        this.populate = (body) => {
            const input = window.$('<input>').attr(
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
            const title = window.$('<span>').text(settings.name)

            body.append(title)
        }

        this.destroy = () => new Promise(
            (resolve) => {
                this.emit('destroy', resolve)
            }
        )
    }
}

export class Column extends EventEmitter {
    constructor(dom, settings) {
        super()

        this.name = settings.name
        this.on('attached',
            () => {
                dom.trigger('kanban.attached')
            }
        )

        this.on('cards.create.request',
            () => {
                dom.trigger('kanban.cards.create.request')
            }
        )

        const heading = window.$('<h6>').text(settings.name)
        const container = window.$('<div>').addClass('kanban-list-container')
        const footer = window.$('<div>').addClass('kanban-list-footer')

        if (settings.can_create_cards) {
            const addBtn = window.$('<button>').addClass(
                'btn btn-outline-primary btn-block mb-3'
            ).text(
                'Add card'
            )

            addBtn.on('click',
                (e) => {
                    e.preventDefault()

                    if (addBtn.attr('disabled')) {
                        return
                    }

                    if (settings.can_create_cards) {
                        const request = new CardCreationRequest(this)

                        request.on('accepted',
                            (subsettings) => {
                                const card = new TemporaryCard(subsettings)

                                card.on('submitted',
                                    (value) => {
                                        card.detatch()
                                        this.emit('cards.create.submit',
                                            {
                                                name: value
                                            }
                                        )
                                    }
                                ).on('cancelled',
                                    () => {
                                        card.detatch()
                                    }
                                ).on('detatched',
                                    () => {
                                        addBtn.removeAttr('disabled')
                                    }
                                )

                                card.attach(container)
                            }
                        ).on('rejected',
                            (reason) => {
                                console.warn('Request rejected.', reason)
                                addBtn.removeAttr('disabled')
                            }
                        ).on('cancelled',
                            () => {
                                console.warn('Request was not fulfilled in time.')
                                addBtn.removeAttr('disabled')
                            }
                        )

                        addBtn.attr('disabled', 'disabled')
                        this.emit('cards.create.request', request)
                    }
                }
            )

            footer.append(addBtn)
        }

        this.addCard = (card) => {
            const subdom = card.attach(container)

            subdom.data('kanban-card', card)
        }

        dom.append(heading)
        dom.append(container)
        dom.append(footer)
    }
}

export class Board extends EventEmitter {
    constructor(dom, id) {
        super()

        const columns = window.$('<div>').addClass(
            'kanban-column-row'
        )

        let columnsByID = {}
        let cardsByID = {}

        this.on('freeze',
            () => {
                console.debug('Board frozen.')
                dom.find('a[href], button').each(
                    function() {
                        const subdom = window.$(this)

                        if (subdom.data('frozen')) {
                            return
                        }

                        if (subdom.attr('disabled')) {
                            return
                        }

                        subdom.attr('disabled', 'disabled')
                        subdom.data('frozen', true)
                    }
                )

                dom.addClass('kanban-frozen')
            }
        ).on('unfreeze',
            () => {
                console.debug('Board unfrozen.')
                dom.find('a[href], button').each(
                    function() {
                        const subdom = window.$(this)

                        if (!subdom.data('frozen')) {
                            return
                        }

                        subdom.removeAttr('disabled')
                        subdom.data('frozen', false)
                    }
                )

                dom.removeClass('kanban-frozen')
            }
        )

        dom.append(columns)
        this.emit('freeze')

        const loadColumns = (data) => {
            console.debug(data)
            columns.html('').css(
                {
                    width: 0
                }
            )

            data.forEach(
                (settings) => {
                    const subdom = window.$('<div>').addClass('kanban-column')
                    const column = new Column(subdom, settings.attributes)

                    column.on('cards.create.request',
                        (request) => {
                            this.emit('cards.create.request', request, column)
                        }
                    ).on('cards.create.submit',
                        (data) => {
                            socket.send(
                                JSON.stringify(
                                    {
                                        method: 'create',
                                        type: 'cards',
                                        attributes: window.$.extend(
                                            {
                                                column: settings.id
                                            },
                                            data
                                        )
                                    }
                                )
                            )
                        }
                    )

                    columnsByID[settings.id] = column
                    settings.cards.forEach(createCard)

                    subdom.data('kanban-column', column)
                    columns.append(subdom)
                    column.emit('attached')

                    const width = subdom.outerWidth(true)
                    columns.width(
                        columns.width() + width + 15
                    )
                }
            )

            this.emit('unfreeze')
        }

        const createCard = (settings) => {
            const columnID = settings.attributes.column
            const column = columnsByID[columnID]

            if (column) {
                const card = new Card(settings.attributes)

                card.on('destroy',
                    (callback) => {
                        console.debug('Destroying card.', settings.id)
                        socket.send(
                            JSON.stringify(
                                {
                                    method: 'delete',
                                    type: 'cards',
                                    id: settings.id
                                }
                            )
                        )

                        callback()
                    }
                )

                column.addCard(card)
                cardsByID[settings.id] = card
            } else {
                console.warn('Could not add card to column', columnID)
            }
        }

        const deleteCard = (id) => {
            const card = cardsByID[id]

            if (card) {
                card.detatch()
            } else {
                console.warn(`Could not find card with ID ${id}.`)
            }
        }

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

            if (data.error) {
                console.warn(data.error)
                return
            }

            if (!data.meta) {
                console.warn('Missing response metadata.')
                return
            }

            switch (data.meta.method) {
                case 'list':
                    switch (data.meta.type) {
                        case 'columns':
                            loadColumns(data.data)
                            return
                    }

                    console.warn('Unrecognised content type.', data.meta.type)
                    return

                case 'create':
                    switch (data.meta.type) {
                        case 'cards':
                            createCard(data.data)
                            return
                    }

                    console.warn('Unrecognised content type.', data.meta.type)
                    return

                case 'delete':
                    switch (data.meta.type) {
                        case 'cards':
                            deleteCard(data.data.id)
                            return
                    }

                    console.warn('Unrecognised content type.', data.meta.type)
                    return
            }

            console.warn('Unrecognised response.', data.meta)
        }

        socket.onopen = () => {
            console.debug('Opened a socket to the Kanban board.')
            socket.send(
                JSON.stringify(
                    {
                        method: 'list',
                        type: 'columns'
                    }
                )
            )
        }
    }
}
