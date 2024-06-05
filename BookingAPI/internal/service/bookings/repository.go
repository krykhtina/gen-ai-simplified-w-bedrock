package bookings

import (
	"booking/internal/domain"
	"context"
)

type bookingsRepository interface {
	AddBooking(ctx context.Context, booking domain.Booking) error
	GetBookingsForProperty(ctx context.Context, propertyId int) ([]domain.Booking, error)
	GetBooking(ctx context.Context, bookingId string) (*domain.Booking, error)
	RemoveBooking(ctx context.Context, bookingId string) error
}

type propertiesRepository interface {
	GetProperty(ctx context.Context, propertyId int) (*domain.Property, error)
}
