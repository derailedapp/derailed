# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

import os
from email.message import EmailMessage

from aiosmtplib import send
from mjml import mjml_to_html

from api.derailed.utils import is_debug

with open("emails/email-verify.mjml", "rb") as f:
    verify_email = f.read().decode()


async def send_verification_email(code1: int, code2: int, email: str) -> None:
    html = mjml_to_html(verify_email.format(CODE=f"{code1}-{code2}")).html

    if is_debug():
        print(html)
        return

    message = EmailMessage()
    message["From"] = os.environ["FROM_EMAIL"]
    message["To"] = email
    message["Subject"] = "Verify Email Address for Derailed"
    message.set_content(html)
    await send(
        message,
        hostname=os.environ["SMTP_HOST"],
        port=int(os.environ["SMTP_PORT"]),
        username=os.getenv("SMTP_USERNAME"),
        password=os.getenv("SMTP_PASSWORD"),
    )
