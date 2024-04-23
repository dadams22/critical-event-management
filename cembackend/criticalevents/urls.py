from django.urls import path, include
from rest_framework import routers
from rest_framework.authtoken import views

from .views import AlertViewSet, MessageView, CreateIncidentReportView, IncidentReportViewSet, PersonViewSet, ResolveIncidentView, TwilioWebhookView, CheckAuthView, SiteViewSet, PingView

router = routers.SimpleRouter()
router.register(r'incident', IncidentReportViewSet, basename='incident')
router.register(r'alert', AlertViewSet, basename='alert')
router.register(r'person', PersonViewSet, basename='person')
router.register(r'site', SiteViewSet, basename='site')

urlpatterns = [
    path('auth', views.obtain_auth_token),
    path('ping', PingView.as_view()),
    path('check-auth', CheckAuthView.as_view()),
    path('report-incident', CreateIncidentReportView.as_view()),
    path('resolve-incident', ResolveIncidentView.as_view()),
    path('message', MessageView.as_view()),
    path('twilio-webhook', TwilioWebhookView.as_view()),
    path('', include(router.urls)),
]
