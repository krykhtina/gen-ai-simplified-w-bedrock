package main

import (
	"context"
	"net/http"
	"strconv"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"booking/configuration"
	"booking/internal/database"
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
	propertyId, ok := request.PathParameters["propertyId"]
	if !ok {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"No property id found"})
	}
	if propertyId == "" {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Empty property id"})
	}
	id, err := strconv.Atoi(propertyId)
	if err != nil {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Invalid property id"})
	}

	property, err := service.GetProperty(ctx, id)
	if err != nil {
		return nil, err
	} else if property == nil {
		return transport.Response(http.StatusNotFound,
			transport.ErrorBody{"Property not found"})
	}

	return transport.Response(http.StatusOK, property)
}

func main() {
	lambda.Start(handler)
}
