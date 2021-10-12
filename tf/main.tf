provider "aws" {
  region = "us-west-2"
}

resource "random_pet" "this" {
  length = 2
}

output "api_endpoint" {
  value = module.api_gateway.apigatewayv2_api_api_endpoint
}
