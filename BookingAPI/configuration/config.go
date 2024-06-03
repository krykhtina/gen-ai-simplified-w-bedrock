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
)

type Config struct {
	AwsConfig           aws.Config
	PropertiesTableName string
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

	return Config{
		AwsConfig:           cfg,
		PropertiesTableName: propertiesTableName,
	}
}
