from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from twilio.twiml.messaging_response import MessagingResponse

from .serializers import AlertSerializer, IncidentReportSerializer, MinimalUserSerializer, PersonSerializer

from .models import Location, Person, IncidentReport, MessageReceipt, PersonStatus
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
        location_data = request.data.get('location', None)

        location = Location.objects.create(
            latitude=location_data['latitude'], 
            longitude=location_data['longitude']
        ) if location_data is not None else None

        incident_report = IncidentReport.objects.create(reporter=user, location=location)
        serializer = IncidentReportSerializer(incident_report)

        # for person in Person.objects.all():
        #     message_body = 'An incident has been reported'
        #     message_id = send_twilio_message(person.phone, message_body, incident=incident_report)

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

class AlertViewSet(viewsets.ViewSet):
    def create(self, request):
        user = request.user
        serializer = AlertSerializer(data={ 'sender': user.id, **request.data })

        if serializer.is_valid():
            alert = serializer.save()

            for person in Person.objects.all():
                send_twilio_message(person, alert.body, alert.incident_report)

            return Response({ 'alert': serializer.data }, status=201)

        print(serializer.errors)

        return Response(serializer.errors, status=400)


class PersonViewSet(viewsets.ModelViewSet):
    serializer_class = PersonSerializer
    queryset = Person.objects.all()


class TwilioWebhookView(APIView):
    def post(self, request):
        body = request.data.get('Body', None)
        sender_phone_number = request.data.get('From', None)

        is_safe = 'safe' in  body.lower()
        needs_help = 'help' in body.lower()

        twiml_response = MessagingResponse()
        
        if body is None or sender_phone_number is None or not (is_safe or needs_help):
            twiml_response.message('Please response with SAFE or HELP to indicate your status.')
        else:
            person = Person.objects.filter(phone=sender_phone_number).first()
            incident_report = IncidentReport.objects.latest('created_at')
            safe_status = PersonStatus.objects.create(person=person, incident_report=incident_report, safe=is_safe)
            twiml_response.message('Thanks, your status has been recorded.')

        return Response(str(twiml_response))
