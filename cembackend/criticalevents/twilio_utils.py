from decouple import config
from twilio.rest import Client

from .models import MessageReceipt, IncidentReport, Person

def send_twilio_message(recipient: Person, message_body: str, incident: IncidentReport) -> str:
    account_sid = config('TWILIO_ACCOUNT_SID')
    auth_token = config('TWILIO_AUTH_TOKEN')
    phone_number = config('TWILIO_PHONE_NUMBER')

    client = Client(account_sid, auth_token)

    message_body = f'TEST: {message_body}\n\nRespond with:\n1. "SAFE" if you are not in danger\n2. "DANGER" if you need assistance'
    
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