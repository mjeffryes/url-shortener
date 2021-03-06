module "api_gateway" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "~> 1.0"

  name          = "${random_pet.this.id}-http"
  description   = "URL shortener API"
  protocol_type = "HTTP"

  create_api_domain_name = false

  integrations = {
    "GET /{shorturl+}" = {
      lambda_arn             = module.lambda_get.lambda_function_arn
      payload_format_version = "2.0"
    }

    "POST /new" = {
      lambda_arn             = module.lambda_new.lambda_function_arn
      payload_format_version = "2.0"
    }
  }

}
