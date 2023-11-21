from decouple import config
import boto3

from .models import MessageReceipt, IncidentReport, Person
from .token_utils import create_short_token

def send_twilio_message(recipient: Person, message_body: str, incident: IncidentReport) -> str:
    access_key = config('AWS_ACCESS_KEY_ID')
    secret_access_key = config('AWS_SECRET_ACCESS_KEY')
    phone_number = config('TWILIO_PHONE_NUMBER')

    client = Client(account_sid, auth_token)

    short_token = create_short_token(incident=incident, person=recipient)

    message_body = f'TEST: {message_body}\n\nRespond with:\n1. "SAFE" if you are not in danger\n2. "SOS" if you need assistance\n\nhttps://localhost:3000/live/{short_token.token}'
    
    message = client.messages.create(
        body=message_body,
        from_=phone_number,
        to=recipient.phone
    )

    message_receipt = MessageReceipt(
        twilio_message_id=message.sid, 
        recipient=recipient,
        body=message_body,
        incident=incident,
        sender_phone=phone_number,
        recipient_phone=recipient.phone
    )
    
    return message.sid