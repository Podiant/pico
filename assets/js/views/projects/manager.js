import ViewBase from '../../lib/classes/view'

const swal = window.swal
const $ = window.$

export default class ProjectManagerView extends ViewBase {
    classNames() {
        return ['update-project-manager']
    }

    ready() {
        $('form[data-id][data-user-id]').each(
            function() {
                const dom = $(this)
                const objID = dom.data('id')
                const userID = dom.data('user-id')
                const getPermissions = () => {
                    const permissions = dom.find('input[name="permissions"]')
                    const data = []

                    permissions.each(
                        function() {
                            const check = $(this)

                            if (check.is(':checked')) {
                                data.push(check.val())
                            }
                        }
                    )

                    return data
                }

                const initialPermissions = getPermissions()

                if (objID === userID) {
                    dom.on('submit',
                        (e) => {
                            const savedPermissions = getPermissions()

                            if (savedPermissions.length < initialPermissions.length) {
                                e.preventDefault()
                                swal(
                                    {
                                        title: 'Heads up',
                                        text: (
                                            'You\'re revoking permissions for your own ' +
                                            'account, which might make certain parts of ' +
                                            'this project stop working for you. Are you ' +
                                            'sure that\'s what you want to do?'
                                        ),
                                        type: 'warning',
                                        showCancelButton: true,
                                        confirmButtonClass: 'btn-danger',
                                        cancelButtonText: 'Cancel',
                                        cancelButtonClass: 'btn-outline-primary'
                                    },
                                    (v) => {
                                        if (v) {
                                            setTimeout(
                                                () => {
                                                    this.submit()
                                                },
                                                333
                                            )
                                        }
                                    }
                                )

                                return false
                            }
                        }
                    )
                }
            }
        )
    }
}
