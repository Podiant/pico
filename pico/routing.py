from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from .onboarding import routing as onboarding
from .projects import routing as projects

application = ProtocolTypeRouter(
    {
        'websocket': AuthMiddlewareStack(
            URLRouter(
                (
                    onboarding.websocket_urlpatterns +
                    projects.websocket_urlpatterns
                )
            )
        )
    }
)
