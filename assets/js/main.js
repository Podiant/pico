import App from './lib/classes/app'
import OnboardingWizardPlugin from './onboarding/wizard'

window.Pico = new App(
    {
        plugins: [
            OnboardingWizardPlugin
        ]
    }
)
