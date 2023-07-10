from django.urls import path, include
from rest_framework import routers
from rest_framework.authtoken import views

from .views import MessageView, CreateIncidentReportView, IncidentReportViewSet

router = routers.SimpleRouter()
router.register(r'incident', IncidentReportViewSet, basename='incident')

urlpatterns = [
    path('auth', views.obtain_auth_token),
    path('report-incident', CreateIncidentReportView.as_view()),
    path('message', MessageView.as_view()),
    path('', include(router.urls)),
]
