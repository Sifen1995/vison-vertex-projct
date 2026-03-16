package handler

import (
	service "my-ecommerce/internal/service/products"
	"my-ecommerce/internal/utils" // Assuming your Role constants are here

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	api            *gin.Engine
	productService service.ProductService
}

func NewProductHandler(api *gin.Engine, productService service.ProductService) *ProductHandler {
	return &ProductHandler{
		api:            api,
		productService: productService,
	}
}

// Updated: roleMiddleware now takes the required Role ID as an argument
func (h *ProductHandler) RouteList(authMiddleware gin.HandlerFunc, roleMiddleware func(uint) gin.HandlerFunc) {

	// 1. Base Group - All product routes require being logged in
	productRoute := h.api.Group("/api/products")
	productRoute.Use(authMiddleware)
	{
		// --- Public/Buyer Routes ---
		productRoute.GET("/get", h.GetAll)
		productRoute.GET("/:id/getone", h.GetOneProduct)

		// --- Seller Routes ---
		// Only Sellers (Role 3) can add or manage their sale status
		sellerOnly := productRoute.Group("/")
		sellerOnly.Use(roleMiddleware(utils.RoleSeller))
		{
			sellerOnly.POST("/add", h.AddProduct)
			sellerOnly.PATCH("/:id/salestat", h.UpdateSaleStatus)
		}

		// --- Admin Only Routes ---
		// Only Admins (Role 1) can approve products
		adminOnly := productRoute.Group("/")
		adminOnly.Use(roleMiddleware(utils.RoleAdmin))
		{
			adminOnly.PATCH("/:id/status", h.UpdateStatus)
		}
	}
}
