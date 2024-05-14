variable "name" {
    description = "The name of the function. Used to compute the funciton_name and handler. Function name is default var.name-var.dor_environment. Handler is default var.name"
}
variable "region" {
    default = "us-east-2"
}
variable "handler" {
    default = ""
    description = "The handler for the funciton. Default is var.name"
}
variable "runtime" {
    default = "nodejs8.10"
    description = "The execution environment. Default nodejs6.10"
}
variable "memory" {
    default = "512"
    description = "The RAM in mb. Default 512mb"
}
variable "timeout" {
    default = "300"
    description = "The timeout in seconds. Default 5min"
}
variable "role" {
    description = "The execution role for the lambda function"
}
variable "filename" {
    default = ""
}
variable "use_timer" {
    default = false
    description = "Whether or not to use a timer for this function. If true then timer arn is required"
}
variable "timer_cron_expression" {
    default = ""
    description = "The timer to subscribe to"
}

variable "use_sqs" {
    default = false
    description = "Whether or not to use SQS. If true then sqs_topic_arn is required"
}
variable "sqs_queue_arn" {
    default = ""
    description = "The arn of the SQS queue that triggers this function. Required if use_sqs is true"
}
variable "sqs_batch_size" {
    default = 1
    description = "Number of a messages a lambda func should pull off the queue at a time. Defaults to 1 if use_sqs is true"
}

variable "env" {
    type = map
    default = {
        NOOP = ""
    }
}

variable "create" {
    default = true
}

variable "use_container_image" {
    default = false
}

variable "container_entry_point" {
    type = list
    default = ["python"]
}

variable "container_command" {
    type = list
    default = []
}

variable "container_working_directory" {
    default = "/code"
}


resource "aws_ecr_repository" "container_image_repository" {
    count = "${ var.create && var.use_container_image ? 1 : 0 }"

    name                 = "${var.name}-lambda"
    image_tag_mutability = "MUTABLE"

    image_scanning_configuration {
        scan_on_push = true
    }
}

resource "aws_lambda_function" "function" {
    count = "${ var.create ? 1 : 0 }"

    package_type = var.use_container_image ? "Image" : "Zip"
    filename = var.use_container_image ? null : "${ var.filename == "" ? "${path.module}/default_lambda_function.zip" : "${ var.filename }" }"
    source_code_hash = var.use_container_image ? null : "${filebase64sha256("${path.module}/default_lambda_function.zip")}"
    image_uri = var.use_container_image ? "${aws_ecr_repository.container_image_repository[0].repository_url}:latest" : null

    dynamic "image_config" {
        for_each = var.use_container_image ? [1] : []
        content {
            entry_point = var.container_entry_point
            command = var.container_command
            working_directory = var.container_working_directory
        }
        # command = var.use_container_image ? [var.handler] : null
    }

    runtime = "${var.runtime}"
    memory_size = "${var.memory}"
    timeout = "${var.timeout}"

    function_name = "${var.name}"
    role = "${var.role}"
    handler = var.use_container_image ? null : "${coalesce(var.handler, "lambda.${var.name}")}"

    # Since we create our lambda tasks here, but deploy them elsewhere, ignore
    # Changes to a lambda tasks function
    lifecycle {
        ignore_changes = [ source_code_size, source_code_hash, filename, last_modified, runtime, image_uri ]
    }

    environment {
        variables = "${ var.env }"
    }
}

resource "aws_cloudwatch_event_rule" "timer" {
    count = "${var.use_timer ? 1 : 0 }"

    name = "${replace(var.name,"_","")}-timer"
    schedule_expression = "${var.timer_cron_expression}"
}

resource "aws_lambda_permission" "allow_cloudwatch" {
    count = "${var.use_timer ? 1 : 0 }"

    statement_id = "${replace(var.name,"_","")}-timer-permission"
    action = "lambda:InvokeFunction"
    function_name = "${aws_lambda_function.function[0].function_name}"
    principal = "events.amazonaws.com"
    source_arn = "${aws_cloudwatch_event_rule.timer[0].arn}"
}

resource "aws_cloudwatch_event_target" "timer_target" {
    count = "${var.use_timer ? 1 : 0 }"

    target_id = "${replace(var.name,"_","")}-timer-target"
    rule = "${aws_cloudwatch_event_rule.timer[0].name}"
    arn = "${aws_lambda_function.function[0].arn}"
}

resource "aws_lambda_event_source_mapping" "sqs" {
    count = var.use_sqs ? 1 : 0
    function_name = aws_lambda_function.function[0].function_name
    event_source_arn = var.sqs_queue_arn
    batch_size = var.sqs_batch_size
    maximum_retry_attempts = 0
}


output "function_arn" {
    value = "${ element( concat( aws_lambda_function.function.*.arn, tolist([""]) ), 0 )  }"
}

output "invoke_arn" {
    value = "${ element( concat( aws_lambda_function.function.*.invoke_arn, tolist([""]) ), 0 )  }"
}
