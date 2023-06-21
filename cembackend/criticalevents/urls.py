from django.urls import path, include
from rest_framework import routers

from .views import MessageView

router = routers.SimpleRouter()

urlpatterns = [
    path('message', MessageView.as_view()),
    path('', include(router.urls)),
]
