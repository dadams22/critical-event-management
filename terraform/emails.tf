module "emails_cron_lambda" {
    source = "./modules/lambda_function"

    name = "pyrite_emails_cron_py"
    # container_command = ["manage.py", "send_compliance_report", "--settings=cembackend.production"]
    container_command = ["/bin/sh", "script/run_send_compliance_report.sh"]
    runtime = "python3.8"
    role = "${ aws_iam_role.lambda_all.arn }"

    use_container_image = true

    use_timer = true
    timer_cron_expression = "rate(24 hours)"
}
