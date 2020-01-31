import ViewBase from '../../lib/classes/view'

export default class CreateProjectView extends ViewBase {
    classNames() {
        return ['projects', 'create-project']
    }

    ready() {
        const $ = this.app.$
        const nameField = $('input[name="name"]')
        const appleField = $('#id_apple_podcasts_id')
        const appleStep = appleField.closest('.step')

        appleStep.on('wizard.shown',
            () => {
                if (appleField.val()) {
                    appleField.trigger('input')
                }
            }
        )

        nameField.on('change',
            () => {
                appleField.val(nameField.val())
            }
        )
    }
}
