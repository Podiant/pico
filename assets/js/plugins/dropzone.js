import EventEmitter from '../lib/classes/event-emitter'
import PluginBase from '../lib/classes/plugin'

const getCookie = (name) => {
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';')
        let cookie = null

        for (var i = 0; i < cookies.length; i ++) {
            cookie = cookies[i].trim()

            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                return decodeURIComponent(
                    cookie.substring(name.length + 1)
                )
            }
        }
    }
}

class FileRequest extends EventEmitter {
    constructor(file) {
        super()

        const xhr = new XMLHttpRequest()
        const csrf = getCookie('csrftoken')
        const data = new FormData()

        this.progress = 0
        xhr.addEventListener('error',
            () => {
                console.error(JSON.parse(xhr.responseText))
                this.emit('error', JSON.parse(xhr.responseText))
            }
        )

        xhr.addEventListener('load',
            () => {
                let data = null

                try {
                    data = JSON.parse(xhr.responseText)
                } catch (err) {
                    this.emit('error',
                        new Error('The server did not respond with JSON.')
                    )

                    return
                }

                if (data.error) {
                    this.emit('error',
                        new Error(data.error, data.detail)
                    )

                    return
                }

                this.emit('complete', data.data)
            }
        )

        if (csrf) {
            data.append('csrfmiddlewaretoken', csrf)
        }

        data.append('files[]', file)

        this.send = (url) => {
            xhr.open('POST', url, true)
            xhr.setRequestHeader('Accept', 'application/json')
            xhr.setRequestHeader('Cache-Control', 'no-cache')
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
            xhr.upload.onprogress = (e) => {
                const percent = Math.round(Math.ceil((e.loaded / e.total) * 100))

                if (percent !== this.progress) {
                    this.progress = percent
                    this.emit('progress', percent)
                }
            }

            xhr.send(data)
            this.emit('started')
        }
    }
}

export class Dropzone extends EventEmitter {
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
                const dt = e.originalEvent.dataTransfer

                e.preventDefault()
                if (!dt.files.length) {
                    return
                }

                let i = 0

                for (i = 0; i < dt.files.length; i ++) {
                    if (!check(dt.files[i])) {
                        this.emit(
                            'error',
                            new Error('The dragged file was not of the correct type.')
                        )

                        return
                    }
                }

                if (dt.files && dt.files.length) {
                    input.get(0).files = dt.files
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
                let text = `${this.files.length} file`

                if (this.files.length > 1) {
                    text += 's'
                }

                for (i = 0; i < this.files.length; i++) {
                    self.emit('file', this.files[i])
                }

                dom.find('.file-count').text(`${text} added`)

                if (this.files.length) {
                    dom.addClass('has-files')
                } else {
                    dom.removeClass('has-files')
                }
            }
        )

        this.submit = (endpoint) => {
            const files = input.get(0).files
            const finished = []
            const upload = (file) => {
                const request = new FileRequest(file)

                request.on(
                    'progress', progress
                ).on('error',
                    (err) => {
                        this.emit('error', new Error(err))
                    }
                ).on('complete',
                    (data) => {
                        finished.push(data)

                        if (finished.length === files.length) {
                            this.emit('complete', finished)
                        }
                    }
                )

                requests.push(request)
                request.send(endpoint)
            }

            const progress = () => {
                const total = 100 * requests.length
                let progress = 0

                requests.forEach(
                    (request) => {
                        progress += request.progress
                    }
                )

                this.emit('progress', progress / total * 100)
            }

            let i = 0
            let requests = []

            for (i = 0; i < files.length; i ++) {
                upload(files[i])
            }

            if (!requests.length) {
                this.emit('complete', [])
            }
        }
    }
}

export class ImageDropzone extends Dropzone {
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
                    dom.data('dropzone', new ImageDropzone(dom))
                } else {
                    dom.data('dropzone', new Dropzone(dom))
                }
            }
        )
    }
}
