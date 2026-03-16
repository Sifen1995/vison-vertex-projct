package repository

import (
	"context"
	"my-ecommerce/internal/model"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (r *ProductState) AddOrIncrementProduct(ctx context.Context, p *model.Product) (*model.Product, error) {
	err := r.db.WithContext(ctx).Clauses(
		clause.OnConflict{
			Columns: []clause.Column{{Name: "seller_id"}, {Name: "name"}},
			DoUpdates: clause.Assignments(map[string]interface{}{
				// Use the database's current count + 1
				"count":      gorm.Expr("products.count + ?", 1),
				"updated_at": time.Now(),
			}),
		},
		// ADD THIS: It forces Postgres to send the final values back to Go
		clause.Returning{},
	).Create(p).Error

	if err != nil {
		return nil, err
	}

	// Now 'p.Count' will contain the actual number from the database!
	return p, nil
}
func (r *ProductState) GetProductById(ctx context.Context, productId uint) (*model.Product, error) {
	var product model.Product
	err := r.db.WithContext(ctx).Where("id=?", productId).First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductState) UpdateApprovalStatus(ctx context.Context, p *model.Product) (*model.Product, error) {
	err := r.db.WithContext(ctx).Model(p).Select("ApprovalStatus", "UpdatedAt").Updates(p).Error

	if err != nil {
		return nil, err
	}

	// Optional: Reload the product to get the full data (Name, UserID, etc.)
	// so the service can return a complete object.
	r.db.WithContext(ctx).First(p, p.ID)

	return p, nil
}

func (r *ProductState) UpdateSaleStatus(ctx context.Context, p *model.Product) (*model.Product, error) {
	err := r.db.WithContext(ctx).Model(p).Select("SaleStatus", "UpdatedAt").Updates(p).Error

	if err != nil {
		return nil, err
	}

	r.db.WithContext(ctx).First(p, p.ID)

	return p, nil
}

func (r *ProductState) GetAll(ctx context.Context) ([]model.Product, error) {
	var products []model.Product

	err := r.db.WithContext(ctx).Find(&products).Error

	if err != nil {
		return nil, err
	}

	return products, nil
}

func (r *ProductState) GetUsersProduct(ctx context.Context, userId uint) ([]model.Product, error) {
	var products []model.Product

	err := r.db.WithContext(ctx).Where("user_id?", userId).Find(&products).Error
	if err != nil {
		return nil, err
	}

	return products, nil
}
