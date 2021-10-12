module "dynamodb_table" {
  source  = "terraform-aws-modules/dynamodb-table/aws"
  version = "~> 1.0"

  name     = "${random_pet.this.id}-urls"
  hash_key = "shortUrl"

  attributes = [
    {
      name = "shortUrl"
      type = "S"
    },
  ]
}
