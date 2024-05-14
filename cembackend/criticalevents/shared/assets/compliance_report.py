from django.contrib.auth import get_user_model
from jinja2 import Template

from criticalevents.models import Asset
from criticalevents.shared.email.main import send_email, get_template

User = get_user_model()


def _get_assets(organization_id: int):
    return Asset.objects.filter(organization_id=organization_id)


def _split_by_maintence(assets):
    out_of_compliance = []
    needs_maintenance = []
    compliant = []

    for asset in assets:
        if asset.maintenance_status == "OUT_OF_COMPLIANCE":
            out_of_compliance.append(asset)
        elif asset.maintenance_status == "NEEDS_MAINTENANCE":
            needs_maintenance.append(asset)
        else:
            compliant.append(asset)

    return out_of_compliance, needs_maintenance, compliant


def get_assets_by_maintenance_status(organization_id: int):
    assets = _get_assets(organization_id)
    return _split_by_maintence(assets)


def generate_report(organization_id):
    out_of_compliance, needs_maintenance, compliant = get_assets_by_maintenance_status(
        organization_id
    )

    needs_maintenance_header = f"{len(needs_maintenance)}"
    if len(needs_maintenance) == 1:
        needs_maintenance_header += " Asset Needs Maintenance"
    else:
        needs_maintenance_header += " Assets Need Maintenance"

    out_of_compliance_header = f"{len(out_of_compliance)}"
    if len(out_of_compliance) == 1:
        out_of_compliance_header += " Asset is Out of Compliance"
    else:
        out_of_compliance_header += " Assets are Out of Compliance"

    compliant_header = f"{len(compliant)}"
    if len(compliant) == 1:
        compliant_header += " Asset is Compliant"
    else:
        compliant_header += " Assets are Compliant"

    for asset in needs_maintenance:
        print(asset.photo)
        if asset.photo:
            print(asset.photo.url)

    template = get_template("compliance")

    jinja_template = Template(template)
    report_html = jinja_template.render(
        needs_maintenance_header=needs_maintenance_header,
        out_of_compliance_header=out_of_compliance_header,
        compliant_header=compliant_header,
        out_of_compliance=out_of_compliance,
        needs_maintenance=needs_maintenance,
        compliant=compliant,
    )

    subject = "Compliance Report"

    if len(out_of_compliance) > 0:
        subject += f" ({len(out_of_compliance)} Out of Compliance) ({len(needs_maintenance)} Needs Maintenance)"

    print(report_html)

    return subject, report_html


def send_compliance_report(organization_id: int):
    """Send a compliance report for an organization to the organization's users"""
    subject, report = generate_report(organization_id)
    users = User.objects.filter(organization_id=organization_id)
    send_email(users, subject, report)


if __name__ == "__main__":
    send_compliance_report(1)
