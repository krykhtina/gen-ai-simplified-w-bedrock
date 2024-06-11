package main

import (
	"booking/configuration"
	"booking/internal/database"
	"booking/internal/domain"
	"booking/internal/service/properties"
	"booking/internal/transport"
	"context"
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// aliasing the types to keep lines short
type Request = events.APIGatewayProxyRequest
type Response = events.APIGatewayProxyResponse

// setting up the services
var config = configuration.New()
var store = database.NewPropertiesStore(config)
var service = properties.NewService(store)

func handler(ctx context.Context, request Request) (*Response, error) {
	body := request.Body
	if body == "" {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Empty body"})
	}

	options := new(domain.SearchOptions)
	err := json.Unmarshal([]byte(body), options)
	if err != nil {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Invalid JSON"})
	}

	if options.City == nil && options.Country == nil {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Missing city or country"})
	}

	properties, err := service.Search(ctx, *options)
	if err != nil {
		switch err {
		case domain.ErrPropertyNotFound:
			return transport.Response(http.StatusNotFound,
				transport.ErrorBody{"Property not found"})
		default:
			return nil, err
		}
	}

	return transport.Response(http.StatusOK, properties)
}

func main() {
	lambda.Start(handler)
}
