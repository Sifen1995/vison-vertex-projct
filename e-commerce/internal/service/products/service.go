package service

import (
	"context"
	"my-ecommerce/internal/cfg"
	dto "my-ecommerce/internal/dto/products"

	"my-ecommerce/internal/model"
	repository "my-ecommerce/internal/repository/products"

	"gorm.io/gorm"
)

type ProductService interface {
	AddProduct(ctx context.Context, req *dto.ProductAddRequest, userId int64) (*model.Product, int, error)
	UpdateStatus(ctx context.Context, approval string, productId uint) (*model.Product, int, error)
	UpdateSaleStatus(ctx context.Context, sale string, productId uint) (*model.Product, int, error)
	GetOneProduct(ctx context.Context, productId uint) (*model.Product, int, error)
	GetAll(ctx context.Context) ([]model.Product, int, error)
	GetUsersProduct(ctx context.Context, userId uint) ([]model.Product, int, error)
}

type ProductServiceState struct {
	config      *cfg.Config
	productRepo repository.ProductRepository
	category    map[string]uint
}

func NewProductService(config *cfg.Config, productRepo repository.ProductRepository, db *gorm.DB) ProductService {

	categoryMap := make(map[string]uint)
	var category []model.Category
	db.Find(&category)

	for _, c := range category {
		categoryMap[c.Name] = c.ID
	}
	return &ProductServiceState{
		config:      config,
		productRepo: productRepo,
		category:    categoryMap,
	}
}
