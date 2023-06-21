# twilio_utils.py

from decouple import config
from twilio.rest import Client

def send_twilio_message(to_phone_number: str, message_body: str):
    account_sid = config('TWILIO_ACCOUNT_SID')
    auth_token = config('TWILIO_AUTH_TOKEN')
    phone_number = config('TWILIO_PHONE_NUMBER')

    print('credentials', account_sid, auth_token, phone_number)

    client = Client(account_sid, auth_token)
    
    message = client.messages.create(
        body=message_body,
        from_=phone_number,
        to=to_phone_number
    )
    
    return message.sid