package handler

import (
	service "my-ecommerce/internal/service/user"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	api         *gin.Engine
	userService service.UserService
}

func NewHandler(api *gin.Engine, userService service.UserService) *UserHandler {
	return &UserHandler{
		api:         api,
		userService: userService,
	}
}

func (h *UserHandler) RouteList(authMiddleware gin.HandlerFunc) {
	authRoute := h.api.Group("/api/auth")
	authRoute.POST("/register", h.Register)
	authRoute.POST("/login", h.Login)
	authRoute.Use(authMiddleware)
	{
		// PATCH because we are updating the User's Role property
		authRoute.PATCH("/upgrade-to-seller", h.Upgrade)
		authRoute.POST("/mfa/setup", h.EnableMFA)

		authRoute.POST("/refresh", h.Refresh)
		authRoute.POST("logout", h.Logout)

		// Step 2: Verifies the first code and enables it
		authRoute.POST("/mfa/verify", h.VerifyAndEnableMFA)
	}
}
