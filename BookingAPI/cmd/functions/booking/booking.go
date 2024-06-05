package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"booking/configuration"
	"booking/internal/database"
	"booking/internal/domain"
	"booking/internal/service/bookings"
	"booking/internal/transport"
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
	body := request.Body
	if body == "" {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Empty body"})
	}

	bookingRequest := new(domain.BookingRequest)
	err := json.Unmarshal([]byte(body), bookingRequest)
	if err != nil {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"Invalid JSON"})
	}
	if !bookingRequest.EndDate.After(bookingRequest.StartDate.Time) {
		return transport.Response(http.StatusBadRequest,
			transport.ErrorBody{"End date should be after start date"})
	}

	confirmation, err := service.BookProperty(ctx, *bookingRequest)
	if err != nil {
		switch err {
		case domain.ErrPropertyNotFound:
			return transport.Response(http.StatusNotFound,
				transport.ErrorBody{"Property not found"})
		case domain.ErrPropertyNotAvailable:
			return transport.Response(http.StatusConflict,
				transport.ErrorBody{"Property not available"})
		default:
			return nil, err
		}
	}

	return transport.Response(http.StatusAccepted, confirmation)
}

func main() {
	lambda.Start(handler)
}
