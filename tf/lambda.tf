module "lambda_get" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "~> 2.0"

  function_name = "${random_pet.this.id}-lambda-get"
  description   = "Redirect short url to long"
  handler       = "index.handler"
  runtime       = "nodejs14.x"
  publish       = true

  source_path = "../src/lookup/dist"
  store_on_s3 = true
  s3_bucket   = module.lambda_builds_bucket.s3_bucket_id

  environment_variables = { "URLS_TABLE" : module.dynamodb_table.dynamodb_table_id }

  attach_tracing_policy    = true
  attach_policy_statements = true

  policy_statements = {
    dynamodb_read = {
      effect    = "Allow",
      actions   = ["dynamodb:GetItem"],
      resources = [module.dynamodb_table.dynamodb_table_arn]
    }
  }

  allowed_triggers = {
    AllowExecutionFromAPIGateway = {
      service    = "apigateway"
      source_arn = "${module.api_gateway.apigatewayv2_api_execution_arn}/*/*/*"
    }
  }
}

module "lambda_new" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "~> 2.0"

  function_name = "${random_pet.this.id}-lambda-new"
  description   = "create a new short url"
  handler       = "index.handler"
  runtime       = "nodejs14.x"
  publish       = true

  source_path = "../src/new/dist"
  store_on_s3 = true
  s3_bucket   = module.lambda_builds_bucket.s3_bucket_id

  environment_variables = { "URLS_TABLE" : module.dynamodb_table.dynamodb_table_id }

  attach_tracing_policy    = true
  attach_policy_statements = true

  policy_statements = {
    dynamodb_read = {
      effect    = "Allow",
      actions   = ["dynamodb:GetItem", "dynamodb:PutItem"],
      resources = [module.dynamodb_table.dynamodb_table_arn]
    }
  }

  allowed_triggers = {
    AllowExecutionFromAPIGateway = {
      service    = "apigateway"
      source_arn = "${module.api_gateway.apigatewayv2_api_execution_arn}/*/*/new"
    }
  }
}

module "lambda_builds_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 2.0"

  bucket        = "${random_pet.this.id}-lambda-builds"
  acl           = "private"
  force_destroy = true

  # S3 bucket-level Public Access Block configuration
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
