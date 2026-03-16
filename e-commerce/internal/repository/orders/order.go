package repository

import (
	"context"
	"errors"
	"fmt"
	"my-ecommerce/internal/model"

	"gorm.io/gorm"
)

func (r *OrderState) CreateComplexOrder(ctx context.Context, buyerID uint, items []model.OrderItem) (*model.Order, error) {
	var order model.Order
	order.BuyerID = buyerID
	order.Status = "pending"

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var total float64

		for i := range items {
			var product model.Product
			// 1. Lock the row for update so no one else can buy it at the same microsecond
			if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&product, items[i].ProductID).Error; err != nil {
				return errors.New("product not found")
			}

			// 2. Check Stock
			if product.Count < items[i].Quantity {
				return fmt.Errorf("insufficient stock for product: %s", product.Name)
			}

			// 3. Calculate Price and update Total
			items[i].PriceAtPurchase = product.Price
			total += product.Price * float64(items[i].Quantity)

			// 4. Decrement Stock
			if err := tx.Model(&product).Update("count", product.Count-items[i].Quantity).Error; err != nil {
				return err
			}
		}

		// 5. Save Order Header
		order.TotalPrice = total
		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		// 6. Save Order Items (Link them to the new Order ID)
		for i := range items {
			items[i].OrderID = order.ID
		}
		if err := tx.Create(&items).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	order.Items = items
	return &order, nil
}

func (r *OrderState) GetOneOrder(ctx context.Context, orderId uint) (*model.Order, error) {
	var order model.Order
	err := r.db.WithContext(ctx).Where("id=?", orderId).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}
