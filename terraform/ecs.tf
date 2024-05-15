resource "aws_ecs_cluster" "cembackend_cluster" {
  name = "cembackend_cluster"
}

resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Effect = "Allow"
        Sid    = ""
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy_attachment" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "cembackend_task_definition" {
  family                   = "cembackend_task_definition"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_tasks_role.arn
  container_definitions    = <<EOF
[
    {
      "name": "cembackend_container",
      "image": "381491906879.dkr.ecr.us-west-1.amazonaws.com/compliance-emails:latest",
      "cpu": 256,
      "memory": 512,
      "portMappings": [],
      "essential": true,
      "command": [
          "python",
          "manage.py",
          "send_compliance_report",
          "--settings=cembackend.production"
      ],
      "environment": [],
      "mountPoints": [],
      "volumesFrom": [],
      "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
              "awslogs-create-group": "true",
              "awslogs-group": "/ecs/cembackend_task_definition",
              "awslogs-region": "us-west-1",
              "awslogs-stream-prefix": "ecs"
          },
          "secretOptions": []
      },
      "systemControls": []
  }
]
EOF
}

resource "aws_cloudwatch_event_rule" "weekly_email_digest" {
  name                = "weekly_email_digest"
  description         = "Trigger ECS task for weekly email digest"
  schedule_expression = "rate(7 days)"
}

resource "aws_cloudwatch_event_target" "trigger_weekly_email_digest" {
  rule      = aws_cloudwatch_event_rule.weekly_email_digest.name
  target_id = "triggerWeeklyEmailDigest"
  arn       = aws_ecs_cluster.cembackend_cluster.arn
  role_arn  = aws_iam_role.ecs_events_role.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.cembackend_task_definition.arn
  }
}

resource "aws_iam_role" "ecs_events_role" {
  name = "ecs_events_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Effect = "Allow"
        Sid    = ""
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_events_role_policy_attachment" {
  role       = aws_iam_role.ecs_events_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceEventsRole"
}
