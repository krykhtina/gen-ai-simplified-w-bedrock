package bookings

import (
	"context"
	"time"

	"booking/internal/database"
	"booking/internal/domain"

	"github.com/google/uuid"
)

type bookingsService struct {
	bookingsRepository   bookingsRepository
	propertiesRepository propertiesRepository
}

func NewService(bookingsRepository bookingsRepository,
	propertiesRepository propertiesRepository) *bookingsService {

	return &bookingsService{
		bookingsRepository:   bookingsRepository,
		propertiesRepository: propertiesRepository,
	}
}

func (srv *bookingsService) BookProperty(ctx context.Context, request domain.BookingRequest) (domain.BookingResponse, error) {
	property, err := srv.propertiesRepository.GetProperty(ctx, request.PropertyId)
	if err != nil {
		return domain.BookingResponse{}, err
	} else if property == nil {
		return domain.BookingResponse{}, domain.ErrPropertyNotFound
	}

	availability, err := srv.GetAvailability(ctx, request.PropertyId, request.StartDate.Time, request.EndDate.Time)
	if err != nil {
		return domain.BookingResponse{}, err
	} else if !availability.Available {
		return domain.BookingResponse{}, domain.ErrPropertyNotAvailable
	}

	bookingID := uuid.New()
	booking := domain.Booking{
		BookingRequest: request,
		BookingId:      bookingID.String(),
	}

	err = srv.bookingsRepository.AddBooking(ctx, booking)
	if err != nil {
		return domain.BookingResponse{}, err
	}

	return domain.BookingResponse{
		BookingId:    bookingID,
		PropertyId:   request.PropertyId,
		CustomerName: request.CustomerName,
		StartDate:    request.StartDate,
		EndDate:      request.EndDate,
		TotalAmount:  calculatePrice(*property, request.StartDate.Time, request.EndDate.Time),
	}, nil
}

func (srv *bookingsService) GetAvailability(ctx context.Context, propertyId int, startDate, endDate time.Time) (domain.Availability, error) {
	property, err := srv.propertiesRepository.GetProperty(ctx, propertyId)
	if err != nil {
		return domain.Availability{}, err
	} else if property == nil {
		return domain.Availability{}, domain.ErrPropertyNotFound
	}

	bookings, err := srv.bookingsRepository.GetBookingsForProperty(ctx, propertyId)
	if err != nil {
		return domain.Availability{}, err
	}

	for _, booking := range bookings {
		if bookingsOverlap(startDate, endDate, booking.StartDate.Time, booking.EndDate.Time) {
			return domain.Availability{
				Available: false,
			}, nil
		}
	}

	return domain.Availability{
		Available: true,
		Price:     calculatePrice(*property, startDate, endDate),
	}, nil
}

func (srv *bookingsService) Cancel(ctx context.Context, bookingId uuid.UUID) error {
	booking, err := srv.bookingsRepository.GetBooking(ctx, bookingId.String())
	if err != nil {
		return err
	} else if booking == nil {
		return domain.ErrBookingNotFound
	}

	err = srv.bookingsRepository.RemoveBooking(ctx, bookingId.String())
	if err != nil {
		switch err.Error() {
		case database.ErrorNotFound:
			return domain.ErrBookingNotFound
		default:
			return err
		}
	}
	return nil
}

func calculatePrice(property domain.Property, startDate, endDate time.Time) float32 {
	daysCount := int(endDate.Sub(startDate).Hours() / 24)
	return float32(property.Size * daysCount)
}

func bookingsOverlap(startDate1, endDate1, startDate2, endDate2 time.Time) bool {
	return startDate1.Before(endDate2) && endDate1.After(startDate2)
}
