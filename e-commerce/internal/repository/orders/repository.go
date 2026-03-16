package repository

import (
	"context"
	"my-ecommerce/internal/cfg"

	"my-ecommerce/internal/model"

	"gorm.io/gorm"
)

type OrderRepository interface {
	CreateComplexOrder(ctx context.Context, buyerID uint, items []model.OrderItem) (*model.Order, error)
	GetOneOrder(ctx context.Context, orderId uint) (*model.Order, error)
}
type OrderState struct {
	db     *gorm.DB // Changed from internalps.DB to *gorm.DB
	config *cfg.Config
}

// NewUserRepository initializes the repository with the GORM instance
func NewOrderRepository(db *gorm.DB, config *cfg.Config) OrderRepository {
	return &OrderState{
		db:     db,
		config: config,
	}
}
