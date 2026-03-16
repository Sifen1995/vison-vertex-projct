package handler

import (
	dto "my-ecommerce/internal/dto/products"
	"my-ecommerce/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Create order
// @Description  Place a new order for the authenticated user
// @Tags         orders
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        payload  body      dto.OrderRequest  true  "Order data"
// @Success      201  {object}  object
// @Failure      400  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /orders/create [post]
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	// 1. Get the Buyer ID from the middleware (Context)
	uid, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", "User not found in session")
		return
	}
	userID := uint(uid.(float64))

	// 2. Bind the JSON Request (The list of items)
	var req dto.OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// 3. Call the Service to process the transaction
	newOrder, status, err := h.orderService.PlaceOrder(c.Request.Context(), userID, req)
	if err != nil {
		// This will catch "insufficient stock" or "product not found"
		utils.SendError(c, status, "Order failed", err.Error())
		return
	}

	// 4. Return the completed Order with its items and total price
	utils.SendSuccess(c, status, "Order placed successfully", newOrder)
}

// @Summary      Get order by ID
// @Description  Retrieve an order by its ID for the authenticated user
// @Tags         orders
// @Security     BearerAuth
// @Produce      json
// @Param        id   path      int  true  "Order ID"
// @Success      200  {object}  object
// @Failure      400  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /orders/{id}/get-one [get]
func (h *OrderHandler) GetOrderById(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", "User not found in session")
		return
	}

	orderid := c.Param("id")
	orderId, err := strconv.ParseUint(orderid, 10, 64)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid product ID format", "Bad Request")
		return
	}

	order, status, err := h.orderService.GetOrderById(c.Request.Context(), uint(orderId))
	if err != nil {
		utils.SendError(c, status, err.Error(), "can not fetch the order")
		return
	}
	utils.SendSuccess(c, status, "order fecthed successfully", order)
}
