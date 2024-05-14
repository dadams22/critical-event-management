import sys
from typing import Any
from django.core.management.base import BaseCommand
from criticalevents.shared.assets.compliance_report import (
    send_compliance_report_all_orgs,
)


class Command(BaseCommand):
    def handle(self, *args: Any, **options: Any) -> str | None:
        send_compliance_report_all_orgs(1)
        sys.exit(0)
