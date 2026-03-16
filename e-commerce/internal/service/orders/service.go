package service

import (
	"my-ecommerce/internal/cfg"

	"context"
	dto "my-ecommerce/internal/dto/products"
	"my-ecommerce/internal/model"
	repository "my-ecommerce/internal/repository/orders"

	"gorm.io/gorm"
)

type OrderService interface {
	PlaceOrder(ctx context.Context, buyerID uint, req dto.OrderRequest) (*model.Order, int, error)
	GetOrderById(ctx context.Context, orderId uint) (*model.Order, int, error)
}

type OrderServiceState struct {
	config    *cfg.Config
	orderRepo repository.OrderRepository
	category  map[string]uint
}

func NewOrderService(config *cfg.Config, orderRepo repository.OrderRepository, db *gorm.DB) OrderService {

	categoryMap := make(map[string]uint)
	var category []model.Category
	db.Find(&category)

	for _, c := range category {
		categoryMap[c.Name] = c.ID
	}
	return &OrderServiceState{
		config:    config,
		orderRepo: orderRepo,
		category:  categoryMap,
	}
}
