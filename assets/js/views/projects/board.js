import ViewBase from '../../lib/classes/view'
import { Board } from '../../plugins/kanban'

export default class BoardDetailView extends ViewBase {
    classNames() {
        return ['projects', 'board-detail']
    }

    ready() {
        const $ = this.app.$

        $('.kanban-board[data-id]').each(
            function() {
                const dom = $(this)
                const board = new Board(dom, dom.data('id'))

                board.on('cards.create.request',
                    (request) => {
                        request.accept(
                            {
                                placeholder: 'Episode title'
                            }
                        )
                    }
                )

                dom.removeAttr('data-id')
                dom.data('kanban-board', board)
            }
        )
    }
}
