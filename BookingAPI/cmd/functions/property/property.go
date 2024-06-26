package main

import (
	"context"
	"net/http"
	"strconv"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"booking/configuration"
	"booking/internal/database"
	"booking/internal/domain"
	"booking/internal/service/properties"
	"booking/internal/transport"
)

// aliasing the types to keep lines short
type Request = events.APIGatewayProxyRequest
type Response = events.APIGatewayProxyResponse

// setting up the services
var config = configuration.New()
var store = database.NewPropertiesStore(config)
var service = properties.NewService(store)

func handler(ctx context.Context, request Request) (*Response, error) {
	propertyIdParam, ok := request.PathParameters["propertyId"]
	if !ok {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"No property id found"})
	}
	if propertyIdParam == "" {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Empty property id"})
	}
	propertyId, err := strconv.Atoi(propertyIdParam)
	if err != nil {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Invalid property id"})
	}

	property, err := service.GetProperty(ctx, propertyId)
	if err != nil {
		switch err {
		case domain.ErrPropertyNotFound:
			return transport.Response(http.StatusNotFound,
				transport.ErrorBody{"Property not found"})
		default:
			return nil, err
		}
	}
	return transport.Response(http.StatusOK, property)
}

func main() {
	lambda.Start(handler)
}
