from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets

from .serializers import IncidentReportSerializer

from .models import Person, IncidentReport
from .twilio_utils import send_twilio_message

class MessageView(APIView):
    def post(self, request):
        recipients = Person.objects.all()

        for recipient in recipients:
            send_twilio_message(recipient.phone, f'TWILIO TEST: Hello, {recipient.first_name} {recipient.last_name}. This is a test message.')
        
        return Response({"message": "Message sent successfully"}, status=status.HTTP_200_OK)


class CreateIncidentReportView(APIView):
    def post(self, request):
        user = request.user
        incident_report = IncidentReport.objects.create(reporter=user)
        serializer = IncidentReportSerializer(incident_report)

        return Response({ 'incident_report': serializer.data, }, status=status.HTTP_200_OK)


class IncidentReportViewSet(viewsets.ViewSet):
    def retrieve(self, request, pk=None):
        try:
            incident_report = IncidentReport.objects.get(id=pk)
            serializer = IncidentReportSerializer(incident_report)
            return Response(serializer.data)
        except IncidentReport.DoesNotExist:
            return Response(
                {"error": "Incident report does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )

