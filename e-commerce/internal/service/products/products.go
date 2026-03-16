package service

import (
	"context"

	"fmt"
	dto "my-ecommerce/internal/dto/products"
	"my-ecommerce/internal/model"
	"net/http"
	"time"
)

func (s *ProductServiceState) AddProduct(ctx context.Context, req *dto.ProductAddRequest, userId int64) (*model.Product, int, error) {

	categoryID, exists := s.category[req.Category]
	if !exists {
		return nil, http.StatusBadRequest, fmt.Errorf("category '%s' does not exist", req.Category)
	}

	now := time.Now()

	productModel := &model.Product{
		// 1. Updated: Use SellerID field name
		SellerID:    uint(userId),
		Name:        req.Name,
		Description: req.Description,
		CategoryID:  categoryID,
		Price:       req.Price,
		Count:       1,
		// 2. Updated: No more .Format() strings! Pass the time object directly.
		CreatedAt: now,
		UpdatedAt: now,
		// 3. New: Defaulting status for the approval flow
		ApprovalStatus: "pending",
		SaleStatus:     "on_sale",
	}

	newProduct, err := s.productRepo.AddOrIncrementProduct(ctx, productModel)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}

	return newProduct, http.StatusCreated, nil
}
func (s *ProductServiceState) UpdateStatus(ctx context.Context, approval string, productId uint) (*model.Product, int, error) {
	now := time.Now()
	updatedModel := &model.Product{
		ID:             productId,
		ApprovalStatus: approval,
		UpdatedAt:      now,
	}
	updatedProduct, err := s.productRepo.UpdateApprovalStatus(ctx, updatedModel)
	if err != nil {

		return nil, http.StatusInternalServerError, err
	}

	return updatedProduct, http.StatusOK, nil
}
func (s *ProductServiceState) UpdateSaleStatus(ctx context.Context, sale string, productId uint) (*model.Product, int, error) {
	now := time.Now()
	updatedModel := &model.Product{
		ID:         productId,
		SaleStatus: sale,
		UpdatedAt:  now,
	}
	updatedProduct, err := s.productRepo.UpdateSaleStatus(ctx, updatedModel)
	if err != nil {

		return nil, http.StatusInternalServerError, err
	}

	return updatedProduct, http.StatusOK, nil
}

func (s *ProductServiceState) GetOneProduct(ctx context.Context, productId uint) (*model.Product, int, error) {
	product, err := s.productRepo.GetProductById(ctx, productId)
	if err != nil {
		return nil, http.StatusInternalServerError, err

	}

	return product, http.StatusOK, nil
}

func (s *ProductServiceState) GetAll(ctx context.Context) ([]model.Product, int, error) {
	products, err := s.productRepo.GetAll(ctx)
	if err != nil {
		return nil, http.StatusInternalServerError, err

	}
	return products, http.StatusOK, nil
}

func (s *ProductServiceState) GetUsersProduct(ctx context.Context, userId uint) ([]model.Product, int, error) {
	products, err := s.productRepo.GetUsersProduct(ctx, userId)
	if err != nil {
		return nil, http.StatusInternalServerError, err

	}
	return products, http.StatusOK, nil

}
