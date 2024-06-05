package main

import (
	"context"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"booking/configuration"
	"booking/internal/database"
	"booking/internal/domain"
	"booking/internal/service/bookings"
	"booking/internal/transport"

	"github.com/google/uuid"
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
	bookingIdParam, ok := request.PathParameters["bookingId"]
	if !ok {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"No booking id found"})
	}
	if bookingIdParam == "" {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Empty booking id"})
	}

	bookingId, err := uuid.Parse(bookingIdParam)
	if err != nil {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Invalid booking id"})
	}

	err = service.Cancel(ctx, bookingId)
	if err != nil {
		switch err {
		case domain.ErrBookingNotFound:
			return transport.Response(http.StatusNotFound,
				transport.ErrorBody{"Booking not found"})
		default:
			return nil, err
		}
	}
	return transport.Response(http.StatusNoContent, nil)
}

func main() {
	lambda.Start(handler)
}
