from django.views.generic.detail import DetailView
from ..models import Board


class BoardDetailView(DetailView):
    model = Board
