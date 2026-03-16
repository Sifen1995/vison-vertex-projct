package handler

import (
	dto "my-ecommerce/internal/dto/products"
	"my-ecommerce/internal/utils"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary      Add new product
// @Description  Create a new product as the authenticated seller
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        payload  body      dto.ProductAddRequest  true  "Product data"
// @Success      201  {object}  object
// @Failure      400  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /products/add [post]
func (h *ProductHandler) AddProduct(c *gin.Context) {
	var (
		ctx = c.Request.Context()
		req dto.ProductAddRequest
	)

	// 1. Get User ID from Middleware
	// Your AuthMiddleware should have set "user_id" into the context
	uid, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User ID not found in context", "Unauthorized")
		return
	}

	// Convert from float64 (JWT default) to int64
	userID := int64(uid.(float64))

	// 2. Bind JSON Request
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid input data", err.Error())
		return
	}

	// 3. Call Service
	// We pass the userID explicitly so the service can set it as the SellerID
	product, status, err := h.productService.AddProduct(ctx, &req, userID)
	if err != nil {
		utils.SendError(c, status, "Failed to add product", err.Error())
		return
	}

	utils.SendSuccess(c, status, "Product added and awaiting admin approval", product)
}

// @Summary      Update product status
// @Description  Update approval status of a product (admin only)
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path      int     true  "Product ID"
// @Param        payload body      object{status=string} true "New status (approved, disapproved, pending)"
// @Success      200  {object}  object
// @Failure      400  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /products/{id}/status [patch]
func (h *ProductHandler) UpdateStatus(c *gin.Context) {
	var (
		ctx = c.Request.Context()
		req struct {
			Status string `json:"status" validate:"required"`
		}
	)

	// 1. Get the ID from the URL
	paramID := c.Param("id")
	productId, err := strconv.ParseUint(paramID, 10, 64)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid product ID format", "Bad Request")
		return
	}

	// 2. IMPORTANT: Bind the JSON FIRST!
	// This is what fills req.Status with the data from your request body.
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid JSON body", err.Error())
		return
	}

	// 3. NOW sanitize and check the data
	req.Status = strings.TrimSpace(strings.ToLower(req.Status))

	if req.Status != "approved" && req.Status != "disapproved" && req.Status != "pending" {
		utils.SendError(c, http.StatusBadRequest, "Invalid status value", "Use: approved, disapproved, or pending")
		return
	}

	// 4. Call Service
	product, status, err := h.productService.UpdateStatus(ctx, req.Status, uint(productId))
	if err != nil {
		utils.SendError(c, status, "Failed to update status", err.Error())
		return
	}

	utils.SendSuccess(c, status, "Product status updated successfully", product)
}

// @Summary      Update product sale status
// @Description  Update sale status of a product (seller only)
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path      int     true  "Product ID"
// @Param        payload body      object{sale_status=string} true "Sale status (on_sale, sold_out)"
// @Success      200  {object}  object
// @Failure      400  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /products/{id}/salestat [patch]
func (h *ProductHandler) UpdateSaleStatus(c *gin.Context) {
	var (
		ctx = c.Request.Context()
		req struct {
			SaleStatus string `json:"sale_status" validate:"required"`
		}
	)

	// 1. Get the ID from the URL
	paramID := c.Param("id")
	productId, err := strconv.ParseUint(paramID, 10, 64)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid product ID format", "Bad Request")
		return
	}

	// 2. IMPORTANT: Bind the JSON FIRST!
	// This is what fills req.Status with the data from your request body.
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid JSON body", err.Error())
		return
	}

	// 3. NOW sanitize and check the data
	req.SaleStatus = strings.TrimSpace(strings.ToLower(req.SaleStatus))

	if req.SaleStatus != "on_sale" && req.SaleStatus != "sold_out" {
		utils.SendError(c, http.StatusBadRequest, "Invalid status value", "Use: approved, disapproved, or pending")
		return
	}

	// 4. Call Service
	product, status, err := h.productService.UpdateSaleStatus(ctx, req.SaleStatus, uint(productId))
	if err != nil {
		utils.SendError(c, status, "Failed to update status", err.Error())
		return
	}

	utils.SendSuccess(c, status, "Product status updated successfully", product)
}

func (h *ProductHandler) GetOneProduct(c *gin.Context) {
	var (
		ctx = c.Request.Context()
	)
	paramID := c.Param("id")
	productId, err := strconv.ParseUint(paramID, 10, 64)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid product ID format", "Bad Request")
		return
	}

	product, status, err := h.productService.GetOneProduct(ctx, uint(productId))
	if err != nil {
		utils.SendError(c, status, "Failed to fetch the product", err.Error())
		return
	}

	utils.SendSuccess(c, status, "Product fetched successfully", product)

}

// @Summary      List products
// @Description  Get all products visible to the authenticated user
// @Tags         products
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  object
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /products/get [get]
func (h *ProductHandler) GetAll(c *gin.Context) {
	var (
		ctx = c.Request.Context()
	)
	products, status, err := h.productService.GetAll(ctx)
	if err != nil {
		utils.SendError(c, status, "Failed to fetch the products", err.Error())
		return
	}
	utils.SendSuccess(c, status, "Products fetched successfully", products)
}
