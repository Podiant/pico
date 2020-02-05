/* eslint-disable no-console */
/* global Promise */
import EventEmitter from '../lib/classes/event-emitter'
import Database from '../lib/classes/database'
import toast from '../lib/helpers/toast'

const $ = window.$

class CardCreationRequest extends EventEmitter {
    constructor(column) {
        super()

        this.accepted = false
        this.rejected = false
        this.cancelled = false

        console.debug('Requesting to add a card in', column.name)

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
            const container = $('<div>').addClass(
                'kanban-card card mb-3'
            )

            const body = $('<div>').addClass('card-body')

            container.append(body)
            dom.append(container)
            this.populate(body)

            if (Object.keys(this.actions).length) {
                const footer = $('<div>').addClass(
                    'card-footer text-right'
                )

                Object.keys(this.actions).forEach(
                    (key) => {
                        const action = this.actions[key]
                        const a = $('<a>').attr('href', 'javascript:;')
                        const icon = $('<i>').addClass(
                            `fa fa-${action.icon || key}`
                        )

                        a.on('click',
                            (e) => {
                                e.preventDefault()
                                action.perform().then(
                                    (result) => {
                                        console.debug('Performed', key, result)
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

                this.detatch = () => {
                    throw new Error('Card has not been attached to a DOM element.')
                }

                this.freeze = () => {
                    throw new Error('Card has not been attached to a DOM element.')
                }

                this.unfreeze = () => {
                    throw new Error('Card has not been attached to a DOM element.')
                }

                this.emit('detatched')
            }

            this.freeze = () => {
                container.addClass('kanban-frozen')
            }

            this.unfreeze = () => {
                container.removeClass('kanban-frozen')
            }

            this.emit('attached')
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

        this.freeze = () => {
            throw new Error('Card has not been attached to a DOM element.')
        }

        this.unfreeze = () => {
            throw new Error('Card has not been attached to a DOM element.')
        }
    }
}

class TemporaryCard extends CardBase {
    constructor(settings) {
        super(settings)

        this.populate = (body) => {
            const input = $('<input>').attr(
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
        this.id = settings.id
        this.ordering = settings.ordering

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
            const title = $('<a>').attr(
                'href', settings.url
            ).text(
                settings.name
            )

            body.append(title)
        }

        this.destroy = () => new Promise(
            (resolve) => {
                this.emit('destroy', resolve)
            }
        )

        this.move = (from, to) => {
            this.freeze()
            this.emit('send', from, to)
        }

        this.update = (newSettings) => {
            settings = newSettings
            this.ordering = newSettings.ordering
            this.name = newSettings.name
        }
    }
}

export class Column extends EventEmitter {
    constructor(dom, settings) {
        super()

        this.id = settings.id
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

        const heading = $('<h6>').text(settings.name)
        const container = $('<div>').addClass('kanban-list-container')
        const footer = $('<div>').addClass('kanban-list-footer')

        if (settings.can_create_cards) {
            const addBtn = $('<button>').addClass(
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
                                ).on('attached',
                                    () => {
                                        dom.trigger('readjust')
                                    }
                                ).on('detatched',
                                    () => {
                                        addBtn.removeAttr('disabled')
                                        dom.trigger('readjust')
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

        dom.append(heading)
        dom.append(container)
        dom.append(footer)

        this.canSend = () => {
            return settings.can_move_out
        }

        this.canReceive = () => {
            return settings.can_move_in
        }

        this.addCard = (card) => {
            const subdom = card.attach(container)

            subdom.data('kanban-card', card)
        }

        this.reorder = (order) => {
            this.emit('cards.reorder', order)
        }

        this.redraw = () => {
            let orderings = {}
            let cardsByOrdering = {}

            container.find('.kanban-card').each(
                function() {
                    const subdom = $(this)
                    const card = subdom.data('kanban-card')

                    orderings[card.ordering] = subdom
                    cardsByOrdering[card.ordering] = card
                    subdom.remove()
                }
            )

            const keys = Object.keys(orderings)

            keys.sort()
            keys.forEach(
                (ordering) => {
                    const subdom = orderings[ordering]
                    const card = cardsByOrdering[ordering]

                    subdom.data('kanban-card', card)
                    container.append(subdom)
                    card.unfreeze()
                }
            )
        }
    }
}

export class Board extends EventEmitter {
    constructor(dom, id) {
        super()

        const columns = $('<div>').addClass(
            'kanban-column-row'
        )

        let columnsByID = {}
        let cardsByID = {}
        let ready = false

        this.on('freeze',
            () => {
                console.debug('Board frozen.')
                dom.find('a[href], button').each(
                    function() {
                        const subdom = $(this)

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
                        const subdom = $(this)

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
            ready = false
            columns.html('').css(
                {
                    width: 0
                }
            )

            data.forEach(
                (settings) => {
                    const subdom = $('<div>').addClass('kanban-column')
                    const column = new Column(
                        subdom,
                        $.extend(
                            {
                                id: settings.id
                            },
                            settings.attributes
                        )
                    )

                    subdom.on('readjust', readjust)
                    column.on('cards.create.request',
                        (request) => {
                            this.emit('cards.create.request', request, column)
                        }
                    ).on('cards.create.submit',
                        (data) => {
                            db.create(
                                {
                                    type: 'cards',
                                    attributes: $.extend(
                                        {
                                            column: settings.id
                                        },
                                        data
                                    )
                                }
                            )
                        }
                    ).on('cards.reorder',
                        (ids) => {
                            let reorderings = []

                            ids.forEach(
                                (id, ordering) => {
                                    reorderings.push(
                                        {
                                            type: 'cards',
                                            id: id,
                                            attributes: {
                                                ordering: ordering
                                            }
                                        }
                                    )
                                }
                            )

                            db.update_list('cards', reorderings)
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

            columns.find('.kanban-column').on('drop',
                function(e, ui) {
                    const card = ui.draggable.data('kanban-card')
                    const sender = ui.draggable.closest('.kanban-column')
                    const from = sender.data('kanban-column')
                    const receiver = $(this)
                    const to = receiver.data('kanban-column')

                    if (card === null || typeof (card) === 'undefined') {
                        console.warning('Lost the card object.')
                        return false
                    }

                    if (!from.canSend(card)) {
                        receiver.removeClass(
                            'kanban-can-receive'
                        ).removeClass(
                            'kanban-cannot-receive'
                        )

                        toast.warning(
                            'Cards can\'t be moved from this column.'
                        )

                        return false
                    }

                    if (!to.canReceive(card)) {
                        toast.warning(
                            'Cards can\'t be moved to this column.'
                        )

                        receiver.removeClass(
                            'kanban-can-receive'
                        ).removeClass(
                            'kanban-cannot-receive'
                        )

                        return false
                    }

                    receiver.removeClass(
                        'kanban-can-receive'
                    ).removeClass(
                        'kanban-cannot-receive'
                    )

                    card.move(from, to)
                }
            ).on('dropover',
                function(e, ui) {
                    const draggable = ui.draggable
                    const card = draggable.data('kanban-card')
                    const sender = draggable.closest('.kanban-column')
                    const from = sender.data('kanban-column')
                    const receiver = $(this)
                    const to = receiver.data('kanban-column')

                    if (sender.is(receiver)) {
                        return false
                    }

                    if (!from.canSend(card)) {
                        receiver.removeClass(
                            'kanban-can-receive'
                        ).addClass(
                            'kanban-cannot-receive'
                        )

                        return false
                    }

                    if (!to.canReceive(card)) {
                        receiver.removeClass(
                            'kanban-can-receive'
                        ).addClass(
                            'kanban-cannot-receive'
                        )

                        return false
                    }

                    receiver.addClass(
                        'kanban-can-receive'
                    ).removeClass(
                        'kanban-cannot-receive'
                    )
                }
            ).on('dropout',
                function() {
                    const receiver = $(this)

                    receiver.removeClass(
                        'kanban-can-receive'
                    ).removeClass(
                        'kanban-cannot-receive'
                    )
                }
            ).droppable()

            columns.find('.kanban-list-container').on('sortstart',
                function(e, ui) {
                    ui.placeholder.height(ui.item.height())
                }
            ).on('sortupdate',
                function() {
                    const column = $(this).closest('.kanban-column').data('kanban-column')
                    let orderings = []

                    $(this).find('.kanban-card').each(
                        function() {
                            const card = $(this).data('kanban-card')

                            card.freeze()
                            orderings.push(card.id)
                        }
                    )

                    column.reorder(orderings)
                }
            ).sortable(
                {
                    placeholder: 'ui-sortable-placeholder mb-3'
                }
            )

            this.emit('unfreeze')
            ready = true
            readjust()
        }

        const readjust = () => {
            let maxHeight = 0

            if (!ready) {
                return
            }

            columns.find('.kanban-column').each(
                function() {
                    const column = $(this)
                    const height = column.outerHeight(true)

                    maxHeight = Math.max(maxHeight, height)
                }
            )

            dom.height(maxHeight)
        }

        const createCard = (settings) => {
            const columnID = settings.attributes.column
            const column = columnsByID[columnID]

            if (column) {
                const attrs = $.extend(
                    {
                        id: settings.id,
                        url: settings.links.detail
                    },
                    settings.attributes
                )

                const card = new Card(attrs)

                card.on(
                    'attached', readjust
                ).on(
                    'detatched', readjust
                ).on('send',
                    (sender, receiver) => {
                        card.freeze()
                        db.update(
                            {
                                type: 'cards',
                                id: card.id,
                                attributes: {
                                    column: receiver.id
                                }
                            }
                        )
                    }
                ).on('destroy',
                    (callback) => {
                        console.debug('Destroying card.', settings.id)
                        db.delete(
                            {
                                type: 'cards',
                                id: settings.id
                            }
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

        const updateCard = (settings) => {
            const card = cardsByID[settings.id]

            if (typeof (card) !== 'undefined') {
                const column = columnsByID[settings.attributes.column]
                const attrs = $.extend(
                    {
                        id: settings.id,
                        url: settings.links.detail
                    },
                    settings.attributes
                )

                card.update(attrs)
                card.detatch()

                if (typeof (column) !== 'undefined') {
                    column.addCard(card)
                }
            }
        }

        const updateCards = (data) => {
            let updatedColumns = {}

            data.forEach(
                (datum) => {
                    const card = cardsByID[datum.id]

                    card.update(datum.attributes)
                    if (typeof (card) !== 'undefined') {
                        const columnID = datum.attributes.column
                        const column = columnsByID[columnID]

                        if (typeof (column) !== 'undefined') {
                            updatedColumns[columnID] = column
                        } else {
                            console.warn(`Can't find column ${columnID}`)
                        }
                    }
                }
            )

            Object.values(updatedColumns).forEach(
                (column) => {
                    column.redraw()
                }
            )
        }

        const deleteCard = (id) => {
            const card = cardsByID[id]

            if (card) {
                card.detatch()
            } else {
                console.warn(`Could not find card with ID ${id}.`)
            }
        }

        const db = new Database(
            `ws://${window.location.host}/ws/kanban/${id}/`
        )

        let disconnected = false

        db.on('connected',
            () => {
                console.debug('Opened a socket to the Kanban board.')

                db.list(
                    {
                        type: 'columns'
                    }
                )

                if (disconnected) {
                    disconnected = false
                    toast.success('Re-established connection with the server.')
                }
            }
        ).on('disconnected',
            () => {
                console.warn('Kanban board socket closed unexpectedly.')
                this.emit('error')
                this.emit('freeze')
                disconnected = true
                toast.error('Lost connection to the server.')
            }
        ).on('listed',
            (type, data) => {
                switch (type) {
                    case 'columns':
                        loadColumns(data)
                        return

                    case 'cards':
                        updateCards(data)
                        return
                }

                console.warn('Unrecognised content type.', type)
            }
        ).on('created',
            (type, data) => {
                switch (type) {
                    case 'cards':
                        createCard(data)
                        return
                }

                console.warn('Unrecognised content type.', type)
            }
        ).on('updated',
            (type, data) => {
                switch (type) {
                    case 'cards':
                        updateCard(data)
                        return
                }

                console.warn('Unrecognised content type.', type)
            }
        ).on('deleted',
            (type, data) => {
                switch (type) {
                    case 'cards':
                        deleteCard(data.id)
                        return
                }

                console.warn('Unrecognised content type.', type)
            }
        )

        db.connect()
    }
}
