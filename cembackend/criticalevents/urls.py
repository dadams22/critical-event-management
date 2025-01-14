from django.urls import path, include, re_path
from rest_framework import routers
from rest_framework.authtoken import views
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from .views import (
    AlertViewSet,
    MessageView,
    CreateIncidentReportView,
    IncidentReportViewSet,
    PersonViewSet,
    ResolveIncidentView,
    TwilioWebhookView,
    CheckAuthView,
    SiteViewSet,
    BuildingViewSet,
    PingView,
    FloorViewSet,
    AssetTypeViewSet,
    AssetViewSet,
    MaintenanceLogViewSet,
    MinimalUserReadOnlyViewSet,
)

schema_view = get_schema_view(
    openapi.Info(
        title="CEM API",
        default_version="v1",
        description="",
        terms_of_service="",
        contact=openapi.Contact(email="m@getkakuna.com"),
        license=openapi.License(name="Private"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

router = routers.SimpleRouter()
router.register(r"incident", IncidentReportViewSet, basename="incident")
router.register(r"alert", AlertViewSet, basename="alert")
router.register(r"person", PersonViewSet, basename="person")
router.register(r"site", SiteViewSet, basename="site")
router.register(r"building", BuildingViewSet, basename="building")
router.register(r"floor", FloorViewSet, basename="floor")
router.register(r"asset_type", AssetTypeViewSet, basename="asset_type")
router.register(r"asset", AssetViewSet, basename="asset")
router.register(r"maintenance_log", MaintenanceLogViewSet, basename="maintenance_log")
router.register(r"user", MinimalUserReadOnlyViewSet, basename="user")

urlpatterns = [
    path("auth", views.obtain_auth_token),
    path("ping", PingView.as_view()),
    path("check_auth", CheckAuthView.as_view()),
    path("report_incident", CreateIncidentReportView.as_view()),
    path("resolve_incident", ResolveIncidentView.as_view()),
    path("message", MessageView.as_view()),
    path("twilio-webhook", TwilioWebhookView.as_view()),
    path(
        "swagger<format>/", schema_view.without_ui(cache_timeout=0), name="schema-json"
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("", include(router.urls)),
]
