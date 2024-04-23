resource "aws_db_instance" "pyrite_db" {
    allocated_storage       = 10
    backup_retention_period = 1
    db_name                 = "pyrite"
    engine                  = "postgres"
    engine_version          = "16.1"
    instance_class          = "db.t4g.micro"
    username                = "root"
    password                = "changeme"
    identifier              = "pyrite-production"
    publicly_accessible     = true
}
