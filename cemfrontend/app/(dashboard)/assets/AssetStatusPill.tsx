'use client';

import { Badge } from '@mantine/core';
import { MaintenanceStatus } from '../../../api/types';

interface ComponentProps {
  status: MaintenanceStatus;
}

export default function AssetStatusPill({ status }: ComponentProps) {
  return status === 'COMPLIANT' ? (
    <Badge color="green">Compliant</Badge>
  ) : status === 'NEEDS_MAINTENANCE' ? (
    <Badge color="yellow">Maintenance Due</Badge>
  ) : status === 'OUT_OF_COMPLIANCE' ? (
    <Badge color="red">Overdue</Badge>
  ) : null;
}
