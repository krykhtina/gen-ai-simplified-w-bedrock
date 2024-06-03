package properties

import (
	"booking/internal/domain"
	"context"
)

type propertiesRepository interface {
	GetProperty(ctx context.Context, id int) (*domain.Property, error)
	Search(ctx context.Context, options domain.SearchOptions) ([]domain.Property, error)
}
