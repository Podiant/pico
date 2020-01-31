import App from './lib/classes/app'
import WizardPlugin from './plugins/wizard'
import DropzonePlugin from './plugins/dropzone'

window.Pico = new App(
    {
        plugins: [
            WizardPlugin,
            DropzonePlugin
        ]
    }
)
