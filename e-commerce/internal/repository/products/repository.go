package repository

import (
	"context"
	"my-ecommerce/internal/cfg"
	"my-ecommerce/internal/model"

	"gorm.io/gorm"
)

type ProductRepository interface {
	AddOrIncrementProduct(ctx context.Context, p *model.Product) (*model.Product, error)
	GetProductById(ctx context.Context, productId uint) (*model.Product, error)
	UpdateApprovalStatus(ctx context.Context, p *model.Product) (*model.Product, error)
	UpdateSaleStatus(ctx context.Context, p *model.Product) (*model.Product, error)
	GetAll(ctx context.Context) ([]model.Product, error)
	GetUsersProduct(ctx context.Context, userId uint) ([]model.Product, error)
}
type ProductState struct {
	db     *gorm.DB // Changed from internalps.DB to *gorm.DB
	config *cfg.Config
}

// NewUserRepository initializes the repository with the GORM instance
func NewProductRepository(db *gorm.DB, config *cfg.Config) ProductRepository {
	return &ProductState{
		db:     db,
		config: config,
	}
}
