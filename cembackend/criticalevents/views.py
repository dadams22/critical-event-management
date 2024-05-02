import base64
from django.utils import timezone
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from twilio.twiml.messaging_response import MessagingResponse

from .serializers import (
    AlertSerializer,
    IncidentReportSerializer,
    PersonSerializer,
    SiteSerializer,
    FloorSerializer,
    AssetTypeSerializer,
    AssetSerializer,
    MaintenanceLogSerializer,
)

from .models import (
    Location,
    Person,
    IncidentReport,
    PersonStatus,
    Site,
    Floor,
    AssetType,
    Asset,
    MaintenanceLog,
)
from .twilio_utils import send_twilio_message

from rest_framework import parsers


def file_from_base64(data):
    # data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//2Q==
    format, imgstr = data.split(";base64,")
    ext = format.split("/")[-1]
    data = ContentFile(base64.b64decode(imgstr), name="temp." + ext)
    return data


class Base64FileJSONParser(parsers.JSONParser):
    media_type = "application/json"

    def _parse_files_rec(self, request_json):
        if not isinstance(request_json, dict):
            return
        for key, value in request_json.items():
            if isinstance(value, str):
                if value.startswith("data:image"):
                    request_json[key] = file_from_base64(value)
            elif isinstance(value, dict):
                self._parse_files_rec(value)
            elif isinstance(value, list):
                for item in value:
                    self._parse_files_rec(item)

    def parse(self, stream, media_type=None, parser_context=None):
        result = super().parse(
            stream, media_type=media_type, parser_context=parser_context
        )
        self._parse_files_rec(result)
        return result


class PingView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"health": "ok"})


class CheckAuthView(APIView):
    def get(self, request):
        return Response({"message": "You are authenticated"})


class MessageView(APIView):
    def post(self, request):
        recipients = Person.objects.all()

        for recipient in recipients:
            send_twilio_message(
                recipient.phone,
                f"TWILIO TEST: Hello, {recipient.first_name} {recipient.last_name}. This is a test message.",
            )

        return Response(
            {"message": "Message sent successfully"}, status=status.HTTP_200_OK
        )


class CreateIncidentReportView(APIView):
    def post(self, request):

        user = request.user
        location_data = request.data.get("location", None)

        location = (
            Location.objects.create(
                latitude=location_data["latitude"],
                longitude=location_data["longitude"],
                organization=user.organization,
            )
            if location_data is not None
            else None
        )

        incident_report = IncidentReport.objects.create(
            reporter=user,
            location=location,
            organization=user.organization,
        )
        serializer = IncidentReportSerializer(incident_report)

        return Response(
            {
                "incident_report": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class IncidentReportViewSet(viewsets.ViewSet):
    def retrieve(self, request, pk=None):
        try:
            incident_report = IncidentReport.objects.get(id=pk)
            serializer = IncidentReportSerializer(incident_report)
            return Response(serializer.data)
        except IncidentReport.DoesNotExist:
            return Response(
                {"error": "Incident report does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )


class AlertViewSet(viewsets.ViewSet):
    def create(self, request):
        user = request.user
        serializer = AlertSerializer(data={"sender": user.id, **request.data})

        if serializer.is_valid():
            alert = serializer.save(organization=user.organization)

            # for person in Person.objects.all():
            #     send_twilio_message(person, alert.body, alert.incident_report)

            return Response({"alert": serializer.data}, status=201)

        print(serializer.errors)

        return Response(serializer.errors, status=400)


class ResolveIncidentView(APIView):
    def post(self, request):
        incident_id = request.data.get("incident_id")
        incident = IncidentReport.objects.get(id=incident_id)
        incident.resolved_at = timezone.now()
        incident.save()

        incident_serializer = IncidentReportSerializer(incident)

        return Response({"incident_report": incident_serializer.data}, status=200)


class TwilioWebhookView(APIView):
    def post(self, request):
        body: str = request.data.get("Body", None)
        sender_phone_number = request.data.get("From", None)

        is_safe = "safe" in body.lower() or body.strip() == "1"
        needs_help = "sos" in body.lower() or body.strip() == "2"

        twiml_response = MessagingResponse()

        if body is None or sender_phone_number is None or not (is_safe or needs_help):
            twiml_response.message(
                "Please response with SAFE or HELP to indicate your status."
            )
        else:
            person = Person.objects.filter(phone=sender_phone_number).first()
            incident_report = IncidentReport.objects.latest("created_at")
            safe_status = PersonStatus.objects.create(
                person=person, incident_report=incident_report, safe=is_safe
            )
            twiml_response.message("Thanks, your status has been recorded.")

        return Response(str(twiml_response))


class OrganizationedViewSet(viewsets.ModelViewSet):
    """An abstract viewset that filters by the current user's organization"""

    model = None
    parser_classes = (Base64FileJSONParser, parsers.MultiPartParser)

    def get_queryset(self):
        return self.model.objects.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.context["organization"] = self.request.user.organization
        serializer.save(organization=self.request.user.organization)


class PersonViewSet(OrganizationedViewSet):
    model = Person
    serializer_class = PersonSerializer


class SiteViewSet(OrganizationedViewSet):
    model = Site
    serializer_class = SiteSerializer


class FloorViewSet(OrganizationedViewSet):
    model = Floor
    serializer_class = FloorSerializer


class AssetTypeViewSet(OrganizationedViewSet):
    model = AssetType
    serializer_class = AssetTypeSerializer


class AssetViewSet(OrganizationedViewSet):
    model = Asset
    serializer_class = AssetSerializer


class MaintenanceLogViewSet(OrganizationedViewSet):
    model = MaintenanceLog
    serializer_class = MaintenanceLogSerializer
