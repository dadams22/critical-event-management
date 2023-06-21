from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Person
from .twilio_utls import send_twilio_message

class MessageView(APIView):
    def post(self, request):
        recipients = Person.objects.all()

        for recipient in recipients:
            send_twilio_message(recipient.phone, f'TWILIO TEST: Hello, {recipient.first_name} {recipient.last_name}. This is a test message.')
        
        return Response({"message": "Message sent successfully"}, status=status.HTTP_200_OK)
