package main

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// aliasing the types to keep lines short
type Request = events.APIGatewayProxyRequest
type Response = events.APIGatewayProxyResponse

func handler(request Request) (Response, error) {
	result := []string{}
	body, err := json.Marshal(result)
	if err != nil {
		return Response{}, err
	}
	return Response{
		Body:       string(body),
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handler)
}
