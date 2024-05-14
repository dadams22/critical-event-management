from functools import cache
import os

from django.contrib.auth import get_user_model
import resend

from criticalevents.shared.config import config

User = get_user_model()


@cache
def _setup_resend():
    resend.api_key = config.RESEND_API_KEY


def send_email(users, subject, message):
    """Send an email to a list of users."""

    _setup_resend()

    for user in users:
        resend.Emails.send(
            {
                "from": "no.reply@kakuna.io",
                "to": user.email,
                "subject": subject,
                "html": message,
            }
        )


def get_template(name):
    """Get the content of an email template."""

    template_folder = os.path.join(os.path.dirname(__file__), "templates")
    with open(os.path.join(template_folder, f"{name}.html")) as f:
        return f.read()
