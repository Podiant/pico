from pico.kanban.views.boards import BoardDetailView as BoardDetailViewBase
from ..models import Board


class BoardDetailView(BoardDetailViewBase):
    model = Board

    def get_queryset(self):
        return super().get_queryset().filter(
            project__slug=self.kwargs['project__slug']
        )
