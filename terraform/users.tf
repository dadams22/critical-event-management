resource "aws_iam_group" "admins" {
  name = "admins"
}

resource "aws_iam_group_policy_attachment" "admins_admin_access" {
  group      = aws_iam_group.admins.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

/*

NOTE: When you add a new user, entirely ignore the pgpkey and the generated
password. Go into the AWS console and reset the password. This will give you a
temporary password that you can use to login.

*/

resource "aws_iam_user" "mike" {
  name = "mike"

  tags = {}
}

resource "aws_iam_user_login_profile" "mike" {
  user    = aws_iam_user.mike.name
  pgp_key = file("pgp.public")
}

resource "aws_iam_user" "dadams" {
  name = "dadams"

  tags = {}
}

resource "aws_iam_user_login_profile" "dadams" {
  user    = aws_iam_user.dadams.name
  pgp_key = file("pgp.public")
}

resource "aws_iam_user" "deploy_user" {
  name = "deploy"

  tags = {
    "AKIAVRUVQRE7VAZBSNIG" = "github"
  }
}

resource "aws_iam_group_membership" "admin_memberships" {
  name = "admin_membership"

  users = [
    "${aws_iam_user.mike.name}",
    "${aws_iam_user.dadams.name}",
    "${aws_iam_user.deploy_user.name}",
  ]

  group = aws_iam_group.admins.name
}

resource "aws_iam_user" "app_user" {
  name = "app"

  tags = {
    "AKIAVRUVQRE7Q4CLHSHK" = "fly.io"
  }
}

resource "aws_iam_policy" "app_policy" {
  name        = "ExternalAppPolicy"
  description = "A policy for an external application to access AWS services"

  # Define the policy
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::${aws_s3_bucket.cembackend_uploads.bucket}",
                "arn:aws:s3:::${aws_s3_bucket.cembackend_uploads.bucket}/*"
            ]
        }
    ]
}
EOF
}

resource "aws_iam_user_policy_attachment" "app_policy_attachment" {
  user       = aws_iam_user.app_user.name
  policy_arn = aws_iam_policy.app_policy.arn
}
