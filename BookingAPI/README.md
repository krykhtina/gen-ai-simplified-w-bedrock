# Booking API

This repository contains a serverless Booking API built with Go. The API allows users to search properties, check availability, book properties, and cancel bookings. It utilizes AWS Lambda and AWS API Gateway for serverless execution and DynamoDB for data storage.

API specification is stored in `api.yaml` and according to the design-first approach
the used data structures are automaticaly generated in `internal/domain/domain.gen.go`.

The binding between API Gateway and the corresponding lambda functions used to process
HTTP requests is done inside API specification (`api.yaml`) through AWS API Gateway
extension (`x-amazon-apigateway-integration`).

## Table of Contents

- [Booking API](#booking-api)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Project Structure](#project-structure)
  - [Local Development](#local-development)
  - [Deployment](#deployment)
  - [Environment Variables](#environment-variables)

## Getting Started

### Prerequisites

- [Go](https://golang.org/dl/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [SAM CLI](https://aws.amazon.com/serverless/sam/)
- [Docker](https://www.docker.com/products/docker-desktop)
- [Make](https://www.gnu.org/software/make/)

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/booking-api.git
    cd booking-api
    ```

2. Install dependencies:
    ```sh
    go mod tidy
    ```

## Project Structure

- `cmd/functions/`: Contains the Lambda functions. One function per each endpoint.
- `configuration/`: Configuration management.
- `internal/database/`: Database access layer.
- `internal/domain/`: Domain models and errors.
- `internal/service/`: Business logic.
- `internal/transport/`: Transport layer and response helpers.
- `local/`: Local development configuration.
- `tools/`: Tooling.
- `api.yaml`: OpenAPI specification.
- `Makefile`: Build and deployment tasks.
- `samconfig.toml`: SAM CLI configuration.
- `template.yaml`: AWS CloudFormation template.

## Local Development

To start the API locally:

1. Start the local DynamoDB instance:
    ```sh
    docker compose -f local/compose.yaml up -d
    ```

2. Build and start the API:
    ```sh
    sam local start-api --env-vars local/env.json
    ```

3. To stop the local DynamoDB instance:
    ```sh
    docker compose -f local/compose.yaml down
    ```

You may also use a make helper target for all above:
```sh
make local
```

## Deployment

To deploy the API to AWS:

1. Build the project:
    ```sh
    sam build
    ```

2. Deploy using SAM CLI:
    ```sh
    sam deploy
    ```

Alternatively, you can use make helper target:
```sh
make deploy
```

## Environment Variables

The following environment variables are required for the application:

- `PROPERTIES_TABLE_NAME`: Name of the DynamoDB table for properties.
- `BOOKINGS_TABLE_NAME`: Name of the DynamoDB table for bookings.
- `AWS_ENDPOINT_URL_DYNAMODB`: (Optional) Endpoint URL for DynamoDB, used for local development.

These variables can be set in the `local/env.json` file for local development.
During deployment they are automatically resolved.
