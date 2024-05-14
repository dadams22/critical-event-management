#!/bin/bash

set -e

python manage.py send_compliance_report --settings=cembackend.production
exit_status=$?

if [ $exit_status -ne 0 ]; then
    echo "Failed"
    exit $exit_status
fi