package middelware

import (
	"my-ecommerce/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RoleMiddleware(requiredRoleID uint) gin.HandlerFunc {
	return func(c *gin.Context) {
		val, exists := c.Get("role_id")
		if !exists {
			utils.SendError(c, http.StatusUnauthorized, "User role not identified", "Unauthorized")
			c.Abort()
			return
		}

		var userRole uint
		// SAFE CONVERSION: Check what the box actually contains
		switch v := val.(type) {
		case float64:
			userRole = uint(v)
		case uint:
			userRole = v
		case int:
			userRole = uint(v)
		default:
			utils.SendError(c, http.StatusInternalServerError, "Invalid role format", "Internal Error")
			c.Abort()
			return
		}

		if userRole != 1 && userRole != requiredRoleID {
			utils.SendError(c, http.StatusForbidden, "Access denied: insufficient permissions", "Forbidden")
			c.Abort()
			return
		}

		c.Next()
	}
}
