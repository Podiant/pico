import EventEmitter from '../lib/classes/event-emitter'
import PluginBase from '../lib/classes/plugin'
import Debouncer from '../lib/classes/debouncer'

class ListItem extends EventEmitter {
    constructor(data) {
        super()

        this.data = data
        this.attach = (dom) => {
            const container = window.$('<a>').addClass(
                'typeahead-item'
            ).addClass(
                'list-group-item'
            ).attr(
                'href',
                'javascript:;'
            )

            if (data.thumbnail) {
                const thumbContainer = window.$('<div>').addClass(
                    'd-flex w-100'
                )

                const thumbImg = window.$('<img>').attr(
                    'src', data.thumbnail
                ).attr(
                    'height', '30'
                ).addClass(
                    'mr-3'
                )

                const span = window.$('<span>').text(data.label)

                thumbImg.appendTo(thumbContainer)
                span.appendTo(thumbContainer)
                thumbContainer.appendTo(container)
            } else {
                container.text(data.label)
            }

            container.on('click',
                () => {
                    this.select()
                }
            )

            container.appendTo(dom)

            this.focus = () => {
                container.addClass('active').addClass('list-item-active')
                this.emit('focused')
            }

            this.blur = () => {
                container.removeClass('active').removeClass('list-item-active')
                this.emit('blurred')
            }

            this.select = () => {
                container.addClass('active').addClass('list-item-active')
                this.emit('selected')
            }
        }

        this.focus = () => {
            throw new Error('List item not attached to container DOM element.')
        }

        this.blur = () => {
            throw new Error('List item not attached to container DOM element.')
        }
    }
}

class List extends EventEmitter {
    constructor(data) {
        super()

        this.attach = (dom) => {
            const container = window.$('<div>').addClass(
                'typeahead-container'
            ).addClass(
                'list-group'
            )

            const position = dom.offset()
            let selectedItem = null
            let items = []

            data.forEach(
                (item, index) => {
                    const listItem = new ListItem(item)

                    listItem.index = index
                    listItem.on('focused',
                        () => {
                            if (selectedItem !== listItem) {
                                if (selectedItem !== null) {
                                    selectedItem.blur()
                                }

                                selectedItem = listItem
                            }
                        }
                    )

                    listItem.on('selected',
                        () => {
                            this.emit('selected', listItem)
                        }
                    )

                    items.push(listItem)
                    listItem.attach(container)
                }
            )

            container.css(
                {
                    position: 'absolute',
                    top: position.top + dom.outerHeight(true),
                    left: position.left,
                    width: dom.outerWidth(true)
                }
            )

            window.$('body').append(container)

            this.detatch = () => {
                container.remove()
            }

            this.moveUp = () => {
                let index = null

                if (selectedItem !== null) {
                    index = selectedItem.index
                }

                if (index === null) {
                    index = data.length - 1
                } else {
                    index = Math.max(0, index - 1)
                }

                this.focus(index)
            }

            this.moveDown = () => {
                let index = null

                if (selectedItem !== null) {
                    index = selectedItem.index
                }

                if (index === null) {
                    index = 0
                } else {
                    index = Math.min(data.length - 1, index + 1)
                }

                this.focus(index)
            }

            this.focus = (index) => {
                if (typeof (index) === 'undefined') {
                    throw new Error('Expected index of item to select.')
                }

                if (typeof (items[index]) !== 'undefined') {
                    items[index].focus()
                } else {
                    if (selectedItem !== null) {
                        selectedItem.blur()
                    }

                    selectedItem = null
                }
            }

            this.select = () => {
                if (selectedItem !== null) {
                    selectedItem.select()
                }
            }
        }

        this.detatch = () => {
            throw new Error('List has not been attached to a DOM element.')
        }
    }
}

class Typeahead extends EventEmitter {
    constructor(input, urlTemplate, dataTransformer) {
        super()

        const name = input.attr('name')
        const replacement = window.$('<input>').attr(
            'name', name
        ).attr(
            'type', 'hidden'
        )

        input.removeAttr('name')
        input.after(replacement)

        const search = new Debouncer(
            (value) => {
                const url = urlTemplate.replace('%s', encodeURIComponent(value))

                window.$.getJSON(url,
                    (data) => {
                        const transformed = dataTransformer(data)
                        const list = new List(transformed)

                        if (input.data('typeahed-list')) {
                            input.data('typeahed-list').detatch()
                        }

                        this.on('move.up',
                            () => {
                                list.moveUp()
                            }
                        )

                        this.on('move.down',
                            () => {
                                list.moveDown()
                            }
                        )

                        this.on('select',
                            () => {
                                list.select()
                            }
                        )

                        list.on('selected',
                            (item) => {
                                replacement.val(item.data.id)
                                input.val(item.data.label)
                                list.detatch()
                                input.focus()
                            }
                        )

                        list.attach(input)
                        input.data('typeahed-list', list)
                    }
                )
            },
            900
        )

        input.on('input', () => search(input.val()))
        input.on('keydown',
            (e) => {
                switch (e.keyCode) {
                    case 40:
                        e.preventDefault()
                        this.emit('move.down')
                        break

                    case 38:
                        e.preventDefault()
                        this.emit('move.up')
                        break

                    case 13:
                        e.preventDefault()
                        e.stopPropagation()
                        this.emit('select')
                        break
                }
            }
        )
    }
}

const Mapper = (template) => {
    const dollar = template.indexOf('.$.')
    const left = template.substr(0, dollar)
    const right = template.substr(dollar + 3)

    return (index, value) => {
        const array = value[left]
        const item = array[index]

        if (typeof (item) === 'undefined') {
            throw new Error('Index out of range.')
        }

        return item[right]
    }
}

const Counter = (template) => {
    const dollar = template.indexOf('.$.')
    const left = template.substr(0, dollar)

    return (value) => {
        const obj = value[left]

        if (Array.isArray(obj)) {
            return obj.length
        }

        throw new Error('Value is not an array.')
    }
}

class Transformer {
    constructor(template) {
        this.transform = (data) => {
            const idTemplate = template.id
            const labelTemplate = template.label
            const thumbnailTemplate = template.thumbnail
            const idMapper = idTemplate ? new Mapper(idTemplate) : null
            const labelMapper = labelTemplate ? new Mapper(labelTemplate) : null
            const thumbnailMapper = thumbnailTemplate ? new Mapper(thumbnailTemplate) : null
            const counter = new Counter(idTemplate)
            let count = 0

            if (!idMapper) {
                throw new Error('No template provided for returning an object ID.')
            }

            if (!labelMapper) {
                throw new Error('No template provided for returning an object label.')
            }

            try {
                count = counter(data)
            } catch (err) {
                throw new Error('Invalid data returned.')
            }

            let i = 0
            let transformed = []
            let map = (index) => {
                let obj = {}

                obj.id = idMapper(index, data)
                obj.label = labelMapper(index, data)

                if (thumbnailMapper) {
                    obj.thumbnail = thumbnailMapper(index, data)
                }

                return obj
            }

            for(i = 0; i < count; i ++) {
                transformed.push(map(i))
            }

            return transformed
        }
    }
}

export default class TypeaheadPlugin extends PluginBase {
    ready() {
        const $ = this.$

        $('input[data-typeahead-url]').each(
            function() {
                const input = $(this)
                const url = input.data('typeahead-url')
                const transformer = new Transformer(
                    input.data('typeahead-transform')
                )

                const ta = new Typeahead(
                    input,
                    url,
                    transformer.transform
                )

                input.removeAttr('data-typeahead-url')
                input.removeAttr('data-typeahead-transform')

                input.data('typeahead', ta)
            }
        )
    }
}
