
resource "aws_iam_policy" "read_production_secret" {
    name = "read_production_secret"
    path = "/"

    policy = <<EOF
{
    "Statement": [
        {
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Effect": "Allow",
            "Resource": "arn:aws:secretsmanager:us-west-1:*:secret:prod/*"
        }
    ],
    "Version": "2012-10-17"

}
EOF
}

resource "aws_iam_policy" "lambda_all" {
    name = "lambda_all_permissions"
    path = "/"

    policy = <<EOF
{
    "Statement": [
        {
            "Action": [
                "iam:PassRole",
                "lambda:*",
                "s3:*",
                "sqs:*",
                "logs:*"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }
    ],
    "Version": "2012-10-17"
}
EOF
}


resource "aws_iam_role" "lambda_all" {
    name = "lambda_all"
    assume_role_policy = <<EOF
{
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Sid": ""
        }
    ],
    "Version": "2008-10-17"
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_all_lambda_all" {
    role = "${aws_iam_role.lambda_all.name}"
    policy_arn = "${aws_iam_policy.lambda_all.arn}"
}

resource "aws_iam_role_policy_attachment" "lambda_all_read_production_secret" {
    role = "${aws_iam_role.lambda_all.name}"
    policy_arn = "${aws_iam_policy.read_production_secret.arn}"
}

resource "aws_iam_role" "ecs_tasks_role" {
  name = "ecs_tasks_role"

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

resource "aws_iam_role_policy" "ecs_tasks_policy" {
  name   = "ecs_tasks_policy"
  role   = aws_iam_role.ecs_tasks_role.id
  policy = data.aws_iam_policy_document.ecs_tasks_policy.json
}

data "aws_iam_policy_document" "ecs_tasks_policy" {
  statement {
    actions   = ["s3:*", "rds:*"]
    resources = ["*"]
    effect    = "Allow"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_tasks_role_read_production_secret" {
    role = "${aws_iam_role.ecs_tasks_role.name}"
    policy_arn = "${aws_iam_policy.read_production_secret.arn}"
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_read_production_secret" {
    role = "${aws_iam_role.ecs_execution_role.name}"
    policy_arn = "${aws_iam_policy.read_production_secret.arn}"
}
