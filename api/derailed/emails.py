# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

from __future__ import annotations

import os
from email.message import EmailMessage

from aiosmtplib import send
from jinja2 import Environment, PackageLoader, select_autoescape
from mjml import mjml_to_html

from .utils import is_debug

env = Environment(loader=PackageLoader("derailed"), autoescape=select_autoescape())

template = env.get_template("email-verify.mjml")


async def send_verification_email(code1: int, code2: int, email: str) -> None:
    html = mjml_to_html(template.render(code=f"{code1}-{code2}")).html

    if is_debug():
        print(f"{code1}-{code2}")
        return

    message = EmailMessage()
    message["From"] = os.environ["FROM_EMAIL"]
    message["To"] = email
    message["Subject"] = "Verify Your Email for Derailed"
    message.set_content(html)
    await send(
        message,
        hostname=os.environ["SMTP_HOST"],
        port=int(os.environ["SMTP_PORT"]),
        username=os.getenv("SMTP_USERNAME"),
        password=os.getenv("SMTP_PASSWORD"),
    )
