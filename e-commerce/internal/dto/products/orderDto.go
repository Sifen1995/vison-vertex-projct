package dto

type OrderRequest struct {
	Items []OrderItemRequest `json:"items" binding:"required,dive"`
}

type OrderItemRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,gt=0"`
}
