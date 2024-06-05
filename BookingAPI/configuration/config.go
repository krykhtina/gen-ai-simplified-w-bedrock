package configuration

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
)

const (
	EnvPropertiesTableName = "PROPERTIES_TABLE_NAME"
	EnvBookingsTableName   = "BOOKINGS_TABLE_NAME"
)

type Config struct {
	AwsConfig           aws.Config
	PropertiesTableName string
	BookingsTableName   string
}

func New() Config {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(fmt.Errorf("unable to load AWS config: %w", err))
	}

	propertiesTableName := os.Getenv(EnvPropertiesTableName)
	if propertiesTableName == "" {
		panic(fmt.Errorf("%s is not set", EnvPropertiesTableName))
	}

	bookingsTableName := os.Getenv(EnvBookingsTableName)
	if bookingsTableName == "" {
		panic(fmt.Errorf("%s is not set", EnvBookingsTableName))
	}

	return Config{
		AwsConfig:           cfg,
		PropertiesTableName: propertiesTableName,
		BookingsTableName:   bookingsTableName,
	}
}
