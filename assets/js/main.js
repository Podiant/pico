import App from './lib/classes/app'
import WizardPlugin from './plugins/wizard'
import DropzonePlugin from './plugins/dropzone'
import TypeaheadPlugin from './plugins/typeahead'

import CreateProjectView from './views/projects/create'

window.Pico = new App(
    {
        plugins: [
            WizardPlugin,
            DropzonePlugin,
            TypeaheadPlugin
        ],
        views: [
            CreateProjectView
        ]
    }
)
