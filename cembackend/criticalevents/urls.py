from django.urls import path, include
from rest_framework import routers
from rest_framework.authtoken import views

from .views import AlertViewSet, MessageView, CreateIncidentReportView, IncidentReportViewSet, TwilioWebhookView

router = routers.SimpleRouter()
router.register(r'incident', IncidentReportViewSet, basename='incident')
router.register(r'alert', AlertViewSet, basename='alert')

urlpatterns = [
    path('auth', views.obtain_auth_token),
    path('report-incident', CreateIncidentReportView.as_view()),
    path('message', MessageView.as_view()),
    path('twilio-webhook', TwilioWebhookView.as_view()),
    path('', include(router.urls)),
]
