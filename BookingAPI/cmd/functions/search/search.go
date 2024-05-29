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
		fmt.Sprintf("location: %s", params["location"]),
		fmt.Sprintf("number_of_beds: %s", params["number_of_beds"]),
		fmt.Sprintf("accessibility: %s", params["accessibility"]),
		fmt.Sprintf("pet_friendly: %s", params["pet_friendly"]),
		fmt.Sprintf("food_accommodation: %s", params["food_accommodation"]),
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
