package handler

import (
	payService "my-ecommerce/internal/service/payment"
	userService "my-ecommerce/internal/service/user"
	"my-ecommerce/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PayHandel struct {
	api           *gin.Engine
	paymetService payService.IPaymentService
	userService   userService.UserService
}

func NewPaymentHandler(api *gin.Engine, paymetService payService.IPaymentService, userService userService.UserService) *PayHandel {
	return &PayHandel{
		api:           api,
		paymetService: paymetService,
		userService:   userService,
	}
}

func (h *PayHandel) RoutList(authMiddelware gin.HandlerFunc) {
	payRoute := h.api.Group("/api/payments")
	payRoute.POST("/stripe-webhook", h.StripeWebhook)
	payRoute.POST("/chapa-webhook", h.ChapaWebhook)
	payRoute.GET("/chapa-webhook", h.ChapaWebhook)
	payRoute.Use(authMiddelware)
	{
		// Path: POST /api/payments/5
		payRoute.POST("/:order_id", h.CreatePayment)
		payRoute.POST("/:order_id/chapa/initialize", h.InitiateChapa)
	}
}

// @Summary      Create Stripe payment
// @Description  Initialize Stripe payment for an order and return client secret
// @Tags         payments
// @Security     BearerAuth
// @Produce      json
// @Param        order_id  path      int  true  "Order ID"
// @Success      200  {object}  object
// @Failure      400  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /payments/{order_id} [post]
func (h *PayHandel) CreatePayment(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", "User not found")
		return
	}
	userID := uint(uid.(float64))

	// 2. Get Order ID from the URL Param (e.g., /api/payments/:order_id)
	orderIDStr := c.Param("order_id")
	orderID, err := strconv.ParseUint(orderIDStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid Order ID", "The ID must be a number")
		return
	}

	// 3. Call Service to get the Stripe Client Secret
	clientSecret, err := h.paymetService.CreateCheckoutSession(c.Request.Context(), uint(orderID), userID)
	if err != nil {
		// This will trigger if the order doesn't belong to the user or Stripe fails
		utils.SendError(c, http.StatusInternalServerError, "Payment initialization failed", err.Error())
		return
	}

	// 4. Return the Secret to the Frontend/Postman
	utils.SendSuccess(c, http.StatusOK, "Payment Intent created", clientSecret)
}

// @Summary      Initialize Chapa payment
// @Description  Initialize Chapa payment for an order and return checkout URL
// @Tags         payments
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        order_id  path      int  true  "Order ID"
// @Param        payload   body      object{amount=number} true "Payment amount"
// @Success      200  {object}  object{checkout_url=string}
// @Failure      400  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /payments/{order_id}/chapa/initialize [post]
func (h *PayHandel) InitiateChapa(c *gin.Context) {
	var req struct {
		Amount float64 `json:"amount" binding:"required"`
	}

	// 1. Get Order ID from URL Param (e.g., /payments/:order_id)
	orderIDStr := c.Param("order_id")
	_, err := strconv.ParseUint(orderIDStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid Order ID", "The ID must be a number")
		return
	}

	// 2. Validate Amount from JSON Body
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	// 3. Get User ID from Context
	uid, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", "User not found in context")
		return
	}
	userID := uint(uid.(float64))

	// 4. Fetch User Email from Service
	user, status, err := h.userService.GetUserById(c.Request.Context(), userID)
	if err != nil {
		utils.SendError(c, status, "can't get user", err.Error())
		return
	}

	// 5. Call Service with the string OrderID as tx_ref
	// Note: Use orderIDStr directly since the service expects a string
	checkoutURL, err := h.paymetService.InitializeChapaPayment(c.Request.Context(), orderIDStr, req.Amount, user.Email)

	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Chapa Initialization Failed", err.Error())
		return
	}

	// 6. Return the link
	utils.SendSuccess(c, http.StatusOK, "Payment link generated", gin.H{
		"checkout_url": checkoutURL,
	})
}
