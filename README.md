# Url Shortener

A serverless URL shortening service (think btly.com or tinyurl.com ) that runs on AWS.

This is a sample project demonstrating serverless deployment and testing. It is functional, but not fully-featured.

## Architecture
(insert pretty picture here)

## Deployment

This project uses a dev Docker image to package all its dependencies.

To build the lambdas run

```bash
  ./run steps/build
```

To deploy the full application run

```bash
  ./run steps/deploy
```

By default the application will be
deployed using your default AWS profile.
You may specify a different profile using
an environment variable:

```bash
  AWS_PROFILE=my_profile ./run steps/deploy
```

## Testing

Unittests may be run with

```bash
  ./run steps/test
```

For an integration test in AWS run

```bash
  ./run steps/integration
```

## Usage/Examples

Shorten a URL:

```bash
  $ curl -v -H 'Content-Type: application/json' https://${API_HOSTNAME}/new --data-ascii '{ "url": "https://twitter.com" }'
  {"shortUrl":"https://<SERVICE_URL>/b190QQ"}
```

Follow a short URL:

```bash
  curl "https://<SERVICE_URL>/b190QQ
```

## TODO
1) Cloudfront for caching and easy name aliasing
2) Friendly web UI for shortening URLS
