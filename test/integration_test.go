package test

import (
	"fmt"
	"testing"
	"time"

	"github.com/gruntwork-io/terratest/modules/terraform"

	http_helper "github.com/gruntwork-io/terratest/modules/http-helper"
)

func TestTerraformHelloWorldExample(t *testing.T) {
	// Construct the terraform options with default retryable errors to handle the most common
	// retryable errors in terraform testing.
	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
		// Set the path to the Terraform code that will be tested.
		TerraformDir: "../tf",
	})

	// Clean up resources with "terraform destroy" at the end of the test.
	defer terraform.Destroy(t, terraformOptions)

	// Run "terraform init" and "terraform apply". Fail the test if there are any errors.
	terraform.InitAndApply(t, terraformOptions)

	// Run `terraform output` to get the values of output variables
	api_endpoint := terraform.Output(t, terraformOptions, "api_endpoint")

	// test that the api responds as expected
	url := fmt.Sprintf("%s/bob", api_endpoint)
	http_helper.HttpGetWithRetry(t, url, nil, 200, "{\"message\":\"Hello, World!\"}", 30, 5*time.Second)
}
