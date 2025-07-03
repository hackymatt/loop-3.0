from django.template.loader import render_to_string
from typing import List
from utils.google.gmail import GmailApi
from global_config import CONFIG
from utils.logger.logger import logger
from django.utils.translation import gettext as _


class Mailer:
    def __init__(self, website_url):
        self.gmail_api = GmailApi(on_behalf_of=CONFIG["noreply_email"])
        self.website_url = website_url

    def send(
        self, email_template: str, to: List[str], subject: str, data, attachments=[]
    ):
        email_body = render_to_string(
            email_template,
            {
                **data,
                **{
                    "website_url": self.website_url,
                    "footer": _(
                        "You received this email to notify you of important changes to your account in loop."
                    ),
                    "company": "loop",
                },
            },
        )
        try:
            self.gmail_api.send(
                CONFIG["noreply_email"],
                email_to=", ".join(to),
                email_subject=subject,
                email_body=email_body,
                email_attachments=attachments,
            )
        except Exception as e:  # pragma: no cover
            logger.error(
                f"Błąd podczas wysyłania wiadomości: {e}", exc_info=True
            )  # pragma: no cover
