package domain

//go:generate go run github.com/deepmap/oapi-codegen/v2/cmd/oapi-codegen --config=config.yaml ../../api.yaml

type Booking struct {
	BookingRequest
	BookingId string `json:"bookingId"`
}