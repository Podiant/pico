import Toast from '../classes/toast'

const toast = (text) => new Toast(
    {
        type: 'info',
        text: text
    }
).show()

toast.info = (text) => new Toast(
    {
        type: 'info',
        text: text
    }
).show()

toast.warning = (text) => new Toast(
    {
        type: 'warning',
        text: text
    }
).show()

toast.error = (text) => new Toast(
    {
        type: 'danger',
        text: text
    }
).show()

toast.success = (text) => new Toast(
    {
        type: 'success',
        text: text
    }
).show()

export default toast
