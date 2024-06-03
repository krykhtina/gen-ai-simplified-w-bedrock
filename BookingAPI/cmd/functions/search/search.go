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
	params := request.QueryStringParameters
	if params == nil {
		return Response{
			Body:       "No query parameters found",
			StatusCode: 400,
		}, nil
	}
	result := []string{
		fmt.Sprintf("city: %s", params["city"]),
		fmt.Sprintf("country: %s", params["country"]),
		fmt.Sprintf("bedrooms: %s", params["bedrooms"]),
		fmt.Sprintf("guests: %s", params["guests"]),
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