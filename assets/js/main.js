import App from './lib/classes/app'
import WizardPlugin from './plugins/wizard'
import DropzonePlugin from './plugins/dropzone'
import TypeaheadPlugin from './plugins/typeahead'

import CreateProjectView from './views/projects/create'
import BoardDetailView from './views/projects/board'
import ProjectManagerView from './views/projects/manager'
import DeliverableDetailView from './views/deliverables/detail'

window.Pico = new App(
    {
        plugins: [
            WizardPlugin,
            DropzonePlugin,
            TypeaheadPlugin
        ],
        views: [
            CreateProjectView,
            BoardDetailView,
            ProjectManagerView,
            DeliverableDetailView
        ]
    }
)
