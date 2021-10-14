package test

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"strings"
	"testing"
	"time"

	"github.com/gruntwork-io/terratest/modules/terraform"

	http_helper "github.com/gruntwork-io/terratest/modules/http-helper"
	"github.com/gruntwork-io/terratest/modules/logger"
	test_structure "github.com/gruntwork-io/terratest/modules/test-structure"
)

type ShortenResp struct {
	ShortUrl string `json:"shortUrl"`
}

func TestTerraformHelloWorldExample(t *testing.T) {
	// Construct the terraform options with default retryable errors to handle the most common
	// retryable errors in terraform testing.
	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
		// Set the path to the Terraform code that will be tested.
		TerraformDir: "../tf",
	})

	working_dir := "./"

	defer test_structure.RunTestStage(t, "cleanup", func() {
		// Clean up resources with "terraform destroy" at the end of the test.
		terraform.Destroy(t, terraformOptions)
	})

	test_structure.RunTestStage(t, "init", func() {
		// Run "terraform init" and "terraform apply". Fail the test if there are any errors.
		terraform.InitAndApply(t, terraformOptions)

		// Run `terraform output` to get the values of output variables
		api_endpoint := terraform.Output(t, terraformOptions, "api_endpoint")

		// Save api_endpoint for other stages
		test_structure.SaveString(t, working_dir, "api_endpoint", api_endpoint)
	})

	test_structure.RunTestStage(t, "shorten", func() {
		// load the api endpoint
		api_endpoint := test_structure.LoadString(t, working_dir, "api_endpoint")

		// shorten a url
		shorten_url := fmt.Sprintf("%s/new", api_endpoint)
		out := http_helper.HTTPDoWithRetry(t, "POST", shorten_url, []byte("{\"url\":\"https://twitter.com\"}"),
			map[string]string{"Content-Type": "application/json"}, 200, 10, 5*time.Second, nil)

		var shorten_resp ShortenResp
		err := json.Unmarshal([]byte(out), &shorten_resp)
		if err != nil {
			t.Fatal(err)
		}

		// Save short url for other stages
		test_structure.SaveString(t, working_dir, "short_url", shorten_resp.ShortUrl)
	})

	test_structure.RunTestStage(t, "lookup", func() {
		// load the short url
		short_url := test_structure.LoadString(t, working_dir, "short_url")

		// lookup the full url
		statusCode, _, headers, err := HTTPDoE(t, "GET", short_url, nil, nil)
		if err != nil {
			t.Fatal(err)
		}
		if statusCode != 301 {
			t.Fatal(fmt.Sprintf("Wrong status code: statusCode = %d", statusCode))
		}
		if headers["Location"][0] != "https://twitter.com" {
			t.Fatal(fmt.Sprintf("Wrong status code: location = %s", headers["Location"][0]))
			t.Fatal()
		}
	})
}

func HTTPDoE(
	t *testing.T, method string, url string, body io.Reader,
	headers map[string]string,
) (int, string, map[string][]string, error) {
	logger.Logf(t, "Making an HTTP %s call to URL %s", method, url)

	tr := &http.Transport{
		TLSClientConfig: nil,
	}

	client := http.Client{
		// By default, Go does not impose a timeout, so an HTTP connection attempt can hang for a LONG time.
		Timeout:   10 * time.Second,
		Transport: tr,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	req := newRequest(method, url, body, headers)
	resp, err := client.Do(req)
	if err != nil {
		return -1, "", nil, err
	}

	serialized_resp, err := httputil.DumpResponse(resp, true)
	if err != nil {
		t.Fatal("Cant' serialize response")
	}
	logger.Logf(t, "%q", serialized_resp)

	defer resp.Body.Close()
	respBody, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		return -1, "", nil, err
	}

	return resp.StatusCode, strings.TrimSpace(string(respBody)), resp.Header, nil
}

func newRequest(method string, url string, body io.Reader, headers map[string]string) *http.Request {
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil
	}
	for k, v := range headers {
		req.Header.Add(k, v)
	}
	return req
}
