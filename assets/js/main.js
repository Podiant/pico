import App from './lib/classes/app'
import WizardPlugin from './plugins/wizard'

window.Pico = new App(
    {
        plugins: [
            WizardPlugin
        ]
    }
)
