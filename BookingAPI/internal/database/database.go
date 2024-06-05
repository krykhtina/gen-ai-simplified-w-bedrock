package database

import (
	"context"
	"errors"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/smithy-go"
)

const (
	ErrorFailedToFetchRecord     = "failed to fetch record"
	ErrorFailedToUnmarshalRecord = "failed to unmarshal record"
	ErrorNotFound                = "not found"
)

type table struct {
	client    *dynamodb.Client
	tableName string
}

func newTable(config aws.Config, tableName string) *table {
	return &table{
		client:    dynamodb.NewFromConfig(config),
		tableName: tableName,
	}
}

func (t *table) getItem(ctx context.Context, key map[string]types.AttributeValue) (
	map[string]types.AttributeValue, error) {

	input := dynamodb.GetItemInput{
		Key:       key,
		TableName: &t.tableName,
	}

	// call the GetItem method to fetch data from dynamoDB table.
	result, err := t.client.GetItem(ctx, &input)

	// Check if the result is nil or if there is any error during fetching the record.
	if err != nil {
		var apiErr smithy.APIError
		if errors.As(err, &apiErr) {
			switch apiErr.(type) {
			case *types.ResourceNotFoundException:
				return nil, nil
			}
		}
		return nil, err //errors.New(ErrorFailedToFetchRecord)
	}

	return result.Item, nil
}

func getItem[T any](ctx context.Context, key map[string]types.AttributeValue, t *table) (*T, error) {
	item, err := t.getItem(ctx, key)
	if err != nil {
		return nil, err
	} else if item == nil {
		return nil, nil
	}

	result := new(T)
	err = attributevalue.UnmarshalMap(item, result)

	if err != nil {
		return nil, err //errors.New(ErrorFailedToUnmarshalRecord)
	}
	return result, nil
}

func (t *table) query(ctx context.Context, indexName *string,
	keyConditionExpression *string, filterExpression *string,
	expressionAttributeValues map[string]types.AttributeValue) (
	[]map[string]types.AttributeValue, error) {

	input := dynamodb.QueryInput{
		IndexName:                 indexName,
		KeyConditionExpression:    keyConditionExpression,
		FilterExpression:          filterExpression,
		ExpressionAttributeValues: expressionAttributeValues,
		TableName:                 &t.tableName,
	}

	// call the Query method to fetch data from dynamoDB table.
	result, err := t.client.Query(ctx, &input)

	// Check if the result is nil or if there is any error during fetching the record.
	if err != nil {
		return nil, err //errors.New(ErrorFailedToFetchRecord)
	}

	return result.Items, nil
}

func query[T any](ctx context.Context, indexName *string,
	keyConditionExpression *string,
	filterExpression *string,
	expressionAttributeValues map[string]types.AttributeValue,
	t *table) ([]T, error) {

	item, err := t.query(ctx, indexName, keyConditionExpression,
		filterExpression, expressionAttributeValues)
	if err != nil {
		return nil, err
	} else if item == nil {
		return nil, nil
	}

	var result []T
	err = attributevalue.UnmarshalListOfMaps(item, &result)

	if err != nil {
		return nil, err //errors.New(ErrorFailedToUnmarshalRecord)
	}
	return result, nil
}

func (t *table) putItem(ctx context.Context, item map[string]types.AttributeValue) error {
	input := dynamodb.PutItemInput{
		Item:      item,
		TableName: &t.tableName,
	}

	_, err := t.client.PutItem(ctx, &input)
	if err != nil {
		return err
	}
	return nil
}

func putItem[T any](ctx context.Context, item T, t *table) error {
	itemMap, err := attributevalue.MarshalMapWithOptions(item,
		func(opt *attributevalue.EncoderOptions) {
			opt.TagKey = "json"
		})
	if err != nil {
		return err
	}
	return t.putItem(ctx, itemMap)
}

func (t *table) deleteItem(ctx context.Context, key map[string]types.AttributeValue) error {

	input := dynamodb.DeleteItemInput{
		Key:       key,
		TableName: &t.tableName,
	}

	// call the DeleteItem method to remove data from dynamoDB table.
	_, err := t.client.DeleteItem(ctx, &input)

	// Check if the result is nil or if there is any error during fetching the record.
	if err != nil {
		var apiErr smithy.APIError
		if errors.As(err, &apiErr) {
			switch apiErr.(type) {
			case *types.ResourceNotFoundException:
				return errors.New(ErrorNotFound)
			}
		}
		return err //errors.New(ErrorFailedToRemoveRecord)
	}

	return nil
}
