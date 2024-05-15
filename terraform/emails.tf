resource "aws_ecr_repository" "container_image_repository" {
    name                 = "compliance-emails"
    image_tag_mutability = "MUTABLE"

    image_scanning_configuration {
        scan_on_push = true
    }
}
