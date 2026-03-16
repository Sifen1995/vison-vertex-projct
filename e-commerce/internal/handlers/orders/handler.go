package handler

import (
	service "my-ecommerce/internal/service/orders"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	api          *gin.Engine
	orderService service.OrderService
}

func NewOrderHandler(api *gin.Engine, orderService service.OrderService) *OrderHandler {
	return &OrderHandler{
		api:          api,
		orderService: orderService,
	}
}

// Updated: roleMiddleware now takes the required Role ID as an argument
func (h *OrderHandler) RouteList(authMiddleware gin.HandlerFunc) {
	orderRoute := h.api.Group("/api/orders")

	orderRoute.Use(authMiddleware)
	{
		orderRoute.POST("/create", h.CreateOrder)
		orderRoute.GET("/:id/get-one", h.GetOrderById)
	}

}
