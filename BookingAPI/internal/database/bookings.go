package database

import (
	"booking/configuration"
	"booking/internal/domain"
	"context"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type bookingsStore struct {
	table *table
}

func NewBookingsStore(config configuration.Config) *bookingsStore {
	return &bookingsStore{
		table: newTable(config.AwsConfig, config.BookingsTableName),
	}
}

func (store *bookingsStore) AddBooking(ctx context.Context, booking domain.Booking) error {
	wrapped := bookingWrapper{
		Booking:   booking,
		StartDate: booking.StartDate.String(),
		EndDate:   booking.EndDate.String(),
	}
	return putItem(ctx, wrapped, store.table)
}

func (store *bookingsStore) GetBookingsForProperty(ctx context.Context, propertyId int) ([]domain.Booking, error) {
	indexName := "PropertyIdIndex"
	keyConditionExpression := "propertyId = :propertyId"
	expressionAttributeValues := map[string]types.AttributeValue{
		":propertyId": &types.AttributeValueMemberN{Value: strconv.Itoa(propertyId)},
	}

	wrapped, err := query[bookingWrapper](
		ctx,
		&indexName,
		&keyConditionExpression,
		nil,
		expressionAttributeValues,
		store.table,
	)
	if err != nil {
		return nil, err
	}
	bookings := make([]domain.Booking, len(wrapped))
	for i, w := range wrapped {
		bookings[i] = w.asBooking()
	}
	return bookings, nil
}

func (store *bookingsStore) GetBooking(ctx context.Context, bookingId string) (*domain.Booking, error) {
	wrapped, err := getItem[bookingWrapper](
		ctx,
		map[string]types.AttributeValue{
			"bookingId": &types.AttributeValueMemberS{Value: bookingId},
		},
		store.table,
	)
	if err != nil {
		return nil, err
	} else if wrapped == nil {
		return nil, nil
	}

	booking := wrapped.asBooking()
	return &booking, nil
}

func (store *bookingsStore) RemoveBooking(ctx context.Context, bookingId string) error {
	key := map[string]types.AttributeValue{
		"bookingId": &types.AttributeValueMemberS{Value: bookingId},
	}
	return store.table.deleteItem(ctx, key)
}

type bookingWrapper struct {
	domain.Booking
	StartDate string `json:"startDate"`
	EndDate   string `json:"endDate"`
}

func (w *bookingWrapper) asBooking() domain.Booking {
	booking := w.Booking
	booking.StartDate.UnmarshalText([]byte(w.StartDate))
	booking.EndDate.UnmarshalText([]byte(w.EndDate))
	return booking
}
