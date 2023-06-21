from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .twilio_utls import send_twilio_message

class MessageView(APIView):
    def post(self, request):
        # Perform any desired logic here
        # Access request data using `request.data`

        send_twilio_message('+18608172974', 'Hello, world!')
        
        return Response({"message": "Message sent successfully"}, status=status.HTTP_200_OK)
