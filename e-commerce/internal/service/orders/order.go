package service

import (
	"context"
	dto "my-ecommerce/internal/dto/products"
	"my-ecommerce/internal/model"
	"net/http"
)

func (s *OrderServiceState) PlaceOrder(ctx context.Context, buyerID uint, req dto.OrderRequest) (*model.Order, int, error) {
	var orderItems []model.OrderItem

	for _, item := range req.Items {
		orderItems = append(orderItems, model.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
		})
	}
	order, err := s.orderRepo.CreateComplexOrder(ctx, buyerID, orderItems)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return order, http.StatusCreated, nil
}
func (s *OrderServiceState) GetOrderById(ctx context.Context, orderId uint) (*model.Order, int, error) {
	order, err := s.orderRepo.GetOneOrder(ctx, orderId)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return order, http.StatusOK, nil
}
