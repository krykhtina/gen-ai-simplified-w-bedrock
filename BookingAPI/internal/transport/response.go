package transport

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
)

type response = events.APIGatewayProxyResponse

func Response(status int, body interface{}) (*response, error) {
	resp := response{
		Headers: map[string]string{
			"Content-Type":                     "application/json",
			"Access-Control-Allow-Origin":      "*",
			"Access-Control-Allow-Headers":     "Content-Type",
			"Access-Control-Allow-Methods":     "OPTIONS, POST, GET, PUT, DELETE",
			"Access-Control-Allow-Credentials": "true",
		},
		StatusCode: status,
	}

	// Convert body to json data
	jBody, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	resp.Body = string(jBody)
	return &resp, nil
}
