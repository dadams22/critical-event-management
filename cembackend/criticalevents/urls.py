from django.urls import path, include
from rest_framework import routers
from rest_framework.authtoken import views

from .views import MessageView, CreateIncidentReportView

router = routers.SimpleRouter()

urlpatterns = [
    path('auth', views.obtain_auth_token),
    path('report-incident', CreateIncidentReportView.as_view()),
    path('message', MessageView.as_view()),
    path('', include(router.urls)),
]
