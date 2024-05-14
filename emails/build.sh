#!/bin/bash

yarn export
cp -r out/*.html ../cembackend/criticalevents/shared/email/templates/
