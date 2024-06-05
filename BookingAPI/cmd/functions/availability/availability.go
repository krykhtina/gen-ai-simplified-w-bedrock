package main

import (
	"booking/configuration"
	"booking/internal/database"
	"booking/internal/service/bookings"
	"booking/internal/transport"
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// aliasing the types to keep lines short
type Request = events.APIGatewayProxyRequest
type Response = events.APIGatewayProxyResponse

// setting up the services
var config = configuration.New()
var bookingsStore = database.NewBookingsStore(config)
var propertiesStore = database.NewPropertiesStore(config)
var service = bookings.NewService(bookingsStore, propertiesStore)

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

	params := request.QueryStringParameters
	if params == nil {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"No query string parameters found"})
	}

	startDateParam, ok := params["startDate"]
	if !ok {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"No start date found"})
	}
	startDate, err := time.Parse("2006-01-02", startDateParam)
	if err != nil {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Invalid start date"})
	}

	endDateParam, ok := params["endDate"]
	if !ok {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"No end date found"})
	}
	endDate, err := time.Parse(time.DateOnly, endDateParam)
	if err != nil {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Invalid end date"})
	}

	if !endDate.After(startDate) {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"End date should be after start date"})
	}

	availability, err := service.GetAvailability(ctx, propertyId, startDate, endDate)
	if err != nil {
		return nil, err
	}

	return transport.Response(http.StatusOK, availability)
}

func main() {
	lambda.Start(handler)
}
