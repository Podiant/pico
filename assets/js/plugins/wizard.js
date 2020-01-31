/* global Promise */

import EventEmitter from '../lib/classes/event-emitter'
import PluginBase from '../lib/classes/plugin'
import EmailValidator from '../lib/validation/email'
import UniqueValidator from '../lib/validation/unique'
import PairlValidator from '../lib/validation/pair'
import ServerValidator from '../lib/validation/server'

class WizardStep extends EventEmitter {
    constructor(wizard, dom) {
        super()

        const submit = () => {
            const buttons = dom.find('button, input[type="button"]').attr('disabled', 'disabled')
            const inputs = dom.find(':input').not(buttons).not('[disabled]')
            const enable = () => {
                buttons.removeAttr('disabled')
                inputs.removeAttr('disabled')
            }

            inputs.attr('disabled', 'disabled')

            this.on('moving.next', enable)
            this.on('validation',
                (err) => {
                    if (err) {
                        enable()
                    }
                }
            )
        }

        this.show = (direction) => {
            return new Promise(
                (resolve) => {
                    if (dom.hasClass('active')) {
                        this.emit('shown')
                        resolve()
                    }

                    this.emit('showing')

                    if (direction) {
                        dom.addClass('showing-' + direction)
                    } else {
                        dom.addClass('showing')
                    }

                    setTimeout(
                        () => {
                            if (direction) {
                                dom.removeClass('showing-' + direction)
                            } else {
                                dom.removeClass('showing')
                            }

                            this.emit('shown')
                            resolve()
                        },
                        333
                    )
                }
            )
        }

        this.hide = (direction) => {
            return new Promise(
                (resolve) => {
                    this.emit('hiding')

                    if (direction) {
                        dom.addClass('hiding-' + direction)
                    } else {
                        dom.addClass('hiding')
                    }

                    setTimeout(
                        () => {
                            if (direction) {
                                dom.removeClass('hiding-' + direction)
                            } else {
                                dom.removeClass('hiding')
                            }

                            this.emit('hidden')
                            resolve()
                        },
                        333
                    )
                }
            )
        }

        this.on('showing',
            () => {
                dom.addClass('active')
            }
        )

        this.on('hidden',
            () => {
                dom.removeClass('active')
            }
        )

        this.on('shown',
            () => {
                dom.find(':input').first().focus()
            }
        )

        this.on('validation',
            (err) => {
                if (typeof (err) === 'undefined') {
                    dom.find(':input.is-invalid').removeClass('is-invalid')
                    dom.find('.invalid-feedback').remove()
                    return
                }

                const field = window.$(err.field)
                const group = field.closest('.form-group')
                let feedback = group.find('.invalid-feedback')

                field.addClass('is-invalid')

                if (!feedback.length) {
                    feedback = window.$('<div>').addClass('invalid-feedback')
                    feedback.appendTo(group)
                }

                feedback.text(err.message)
                field.focus()
            }
        )

        this.prev = () => {
            this.hide('rw').then(
                () => {
                    this.emit('moving.prev')
                    this.emit('prev')
                }
            )
        }

        this.next = () => {
            submit()
            this.emit('validation')

            this.validate().then(
                () => {
                    this.emit('moving.next')
                    this.hide('ff').then(
                        () => {
                            this.emit('next')
                        }
                    )
                }
            ).catch(
                (err) => {
                    this.emit('validation', err)
                }
            )
        }

        this.validate = () => {
            return new Promise(
                (resolve, reject) => {
                    let rejected = false
                    let waitingValidators = []
                    const form = dom.closest('form')

                    dom.find(':input').each(
                        function() {
                            if (rejected) {
                                return false
                            }

                            const input = window.$(this)
                            const value = input.val()
                            const required = input.attr('required')
                            const type = input.attr('type') || 'text'
                            const unique = input.attr('data-unique')
                            const serverSide = input.attr('data-validator')
                            const pairWith = input.attr('data-pair')

                            if (required && !value.trim()) {
                                rejected = true
                                reject(
                                    {
                                        field: input,
                                        message: 'This field is required.'
                                    }
                                )

                                return false
                            }

                            switch (type) {
                                case 'email':
                                    waitingValidators.push(
                                        [
                                            new EmailValidator(),
                                            input
                                        ]
                                    )

                                    break
                            }

                            if (unique) {
                                waitingValidators.push(
                                    [
                                        new UniqueValidator(unique),
                                        input
                                    ]
                                )
                            }

                            if (serverSide) {
                                waitingValidators.push(
                                    [
                                        new ServerValidator(serverSide),
                                        input
                                    ]
                                )
                            }

                            if (pairWith) {
                                waitingValidators.push(
                                    [
                                        new PairlValidator(
                                            form.find(`:input[name="${pairWith}"]`).val()
                                        ),
                                        input
                                    ]
                                )
                            }
                        }
                    )

                    const validateNext = () => {
                        const pair = waitingValidators.shift()
                        const validator = pair[0]
                        const input = pair[1]
                        const value = input.val().trim()

                        validator.check(value).then(
                            () => {
                                if (waitingValidators.length) {
                                    validateNext()
                                } else if (!rejected) {
                                    resolve()
                                }
                            }
                        ).catch(
                            (err) => {
                                if (!rejected) {
                                    rejected = true

                                    reject(
                                        {
                                            field: input,
                                            message: err.message
                                        }
                                    )
                                }
                            }
                        )
                    }

                    if (!waitingValidators.length) {
                        if (!rejected) {
                            resolve()
                        }
                    } else {
                        validateNext()
                    }
                }
            )
        }

        const self = this

        dom.on('click', '[data-action="prev"]',
            function() {
                self.prev()
            }
        )

        dom.on('click', '[data-action="next"]',
            function() {
                self.next()
            }
        )

        dom.on('keydown', ':input',
            function(e) {
                if (e.keyCode === 13) {
                    self.next()
                }
            }
        )
    }
}

class Wizard extends EventEmitter {
    constructor(dom) {
        super()

        const self = this
        let steps = []

        dom.find('.step').each(
            function() {
                const subdom = window.$(this)
                const step = new WizardStep(self, subdom)

                subdom.data('wizard-step', step)
                steps.push(step)
            }
        )

        steps.forEach(
            (step, i) => {
                if (i > 0) {
                    step.on('moving.prev',
                        () => {
                            const prev = steps[i - 1]

                            prev.show('rw')
                        }
                    )
                }

                if (i < steps.length - 1) {
                    step.on('moving.next',
                        () => {
                            const next = steps[i + 1]

                            next.show('ff')
                        }
                    )
                } else {
                    step.on('next',
                        () => {
                            this.submit()
                        }
                    )
                }
            }
        )

        this.show = (stepIndex) => {
            if (typeof (stepIndex) === 'undefined') {
                stepIndex = 0
            }

            dom.find('.step').each(
                function(index) {
                    const subdom = window.$(this)
                    const isInvalid = subdom.find('.form-group.is-invalid').length

                    if (isInvalid) {
                        stepIndex = index
                        return false
                    }
                }
            )

            steps[stepIndex].show()
        }

        this.submit = () => {
            const form = dom.closest('form')

            form.submit()
        }
    }
}

export default class WizardPlugin extends PluginBase {
    ready() {
        const $ = this.$

        $('.wizard').each(
            function() {
                const wizard = new Wizard($(this))

                wizard.show()
            }
        )
    }
}
