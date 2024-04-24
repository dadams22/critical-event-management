from django.utils.crypto import get_random_string
from .models import ShortToken, Person, IncidentReport


def create_short_token(incident: IncidentReport, person: Person) -> ShortToken:
    token_string = get_random_string(length=10)
    short_token = ShortToken(
        incident_report=incident, person=person, token=token_string
    )
    short_token.save()
    return short_token
