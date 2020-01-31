import EventEmitter from '../lib/classes/event-emitter'
import PluginBase from '../lib/classes/plugin'

class Dropzone extends EventEmitter {
    constructor(dom) {
        super()

        const input = dom.find('input[type="file"]')
        const mimeType = input.attr('accept')
        const self = this
        const check = (file) => {
            if (mimeType) {
                const typeEx = new RegExp('^' + mimeType.replace('/', '\\/').replace('*', '.*'))
                const match = file.type.match(typeEx)

                if (!match) {
                    return false
                }
            }

            return true
        }

        dom.on('dragenter',
            (e) => {
                e.preventDefault()
                dom.addClass('active')
                this.emit('drag.enter')
            }
        ).on('dragleave',
            (e) => {
                e.preventDefault()
                dom.removeClass('active')
                this.emit('drag.exit')
            }
        ).on('dragover',
            (e) => {
                e.preventDefault()
                dom.addClass('active')
                this.emit('drag.over')
            }
        ).on('drop',
            (e) => {
                e.preventDefault()

                if (e.originalEvent.dataTransfer.files.length !== 1) {
                    return
                }

                let i = 0

                for (i = 0; i < e.originalEvent.dataTransfer.files.length; i ++) {
                    if (!check(e.originalEvent.dataTransfer.files[i])) {
                        this.emit(
                            'error',
                            new Error('The dragged file was not of the correct type.')
                        )

                        return
                    }
                }

                if (e.originalEvent.dataTransfer.files) {
                    input.get(0).files = e.originalEvent.dataTransfer.files
                    input.trigger('change')
                }
            }
        ).on('click',
            (e) => {
                if (e.target === input.get(0)) {
                    return
                }

                e.preventDefault()
                input.get(0).click()
            }
        )

        input.on('change',
            function() {
                let i = 0

                for (i = 0; i < this.files.length; i++) {
                    self.emit('file', this.files[i])
                }
            }
        )
    }
}

class ImageDropzone extends Dropzone {
    constructor(dom) {
        super(dom)

        this.on('error',
            () => {
                alert('Only images are supported here.')
            }
        )

        this.on('file',
            (file) => {
                const reader = new FileReader()

                reader.onload = (e) => {
                    dom.css(
                        'background-image',
                        `url(${e.target.result})`
                    )
                }

                reader.readAsDataURL(file)
            }
        )
    }
}

export default class DropzonePlugin extends PluginBase {
    ready() {
        const $ = this.$

        $('.dropzone').each(
            function() {
                const dom = $(this)

                if (dom.hasClass('dropzone-image')) {
                    new ImageDropzone(dom)
                } else {
                    new Dropzone(dom)
                }
            }
        )
    }
}
