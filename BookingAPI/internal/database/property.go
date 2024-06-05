package database

import (
	"booking/configuration"
	"booking/internal/domain"
	"context"
	"strconv"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type propertiesStore struct {
	table *table
}

func NewPropertiesStore(config configuration.Config) *propertiesStore {
	return &propertiesStore{
		table: newTable(config.AwsConfig, config.PropertiesTableName),
	}
}

func (store *propertiesStore) GetProperty(ctx context.Context, propertyId int) (*domain.Property, error) {
	return getItem[domain.Property](
		ctx,
		map[string]types.AttributeValue{
			"propertyId": &types.AttributeValueMemberN{Value: strconv.Itoa(propertyId)},
		},
		store.table,
	)
}

func (store *propertiesStore) Search(ctx context.Context, options domain.SearchOptions) ([]domain.Property, error) {
	var indexName string
	var keyConditionExpression string
	expressionAttributeValues := map[string]types.AttributeValue{}
	filterExpressions := []string{}

	if options.City != nil {
		indexName = "CityIndex"
		keyConditionExpression = "city = :city"
	} else if options.Country != nil {
		indexName = "CountryIndex"
		keyConditionExpression = "country = :country"
	} else if options.Bedrooms != nil {
		indexName = "BedroomsIndex"
		keyConditionExpression = "bedrooms = :bedrooms"
	} else if options.Guests != nil {
		indexName = "GuestsIndex"
		keyConditionExpression = "guests = :guests"
	}

	if options.City != nil {
		expressionAttributeValues[":city"] = &types.AttributeValueMemberS{Value: *options.City}
	}
	if options.Country != nil {
		expressionAttributeValues[":country"] = &types.AttributeValueMemberS{Value: *options.Country}
		if indexName != "CountryIndex" {
			filterExpressions = append(filterExpressions, "country = :country")
		}
	}
	if options.Bedrooms != nil {
		expressionAttributeValues[":bedrooms"] = &types.AttributeValueMemberN{Value: strconv.Itoa(*options.Bedrooms)}
		if indexName != "BedroomsIndex" {
			filterExpressions = append(filterExpressions, "bedrooms = :bedrooms")
		}
	}
	if options.Guests != nil {
		expressionAttributeValues[":guests"] = &types.AttributeValueMemberN{Value: strconv.Itoa(*options.Guests)}
		if indexName != "GuestsIndex" {
			filterExpressions = append(filterExpressions, "guests = :guests")
		}
	}

	var filterExpression *string
	if len(filterExpressions) > 0 {
		combinedFilterExpressions := strings.Join(filterExpressions, " AND ")
		filterExpression = &combinedFilterExpressions
	}

	return query[domain.Property](
		ctx,
		&indexName,
		&keyConditionExpression,
		filterExpression,
		expressionAttributeValues,
		store.table,
	)
}
