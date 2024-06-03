package properties

import (
	"booking/internal/domain"
	"context"
)

type propertiesService struct {
	propertiesRepository propertiesRepository
}

func NewService(propertyRepository propertiesRepository) *propertiesService {
	return &propertiesService{propertyRepository}
}

func (srv *propertiesService) GetProperty(ctx context.Context, id int) (*domain.Property, error) {
	return srv.propertiesRepository.GetProperty(ctx, id)
}

func (srv *propertiesService) Search(ctx context.Context, options domain.SearchOptions) ([]domain.Property, error) {
	return srv.propertiesRepository.Search(ctx, options)
}
