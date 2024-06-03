package main

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// aliasing the types to keep lines short
type Request = events.APIGatewayProxyRequest
type Response = events.APIGatewayProxyResponse

func handler(request Request) (Response, error) {
	propertyId, ok := request.PathParameters["propertyId"]
	if !ok {
		return Response{
			Body:       "No property id found",
			StatusCode: 400,
		}, nil
	}
	result := []string{
		fmt.Sprintf("propertyId: %s", propertyId),
	}
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
