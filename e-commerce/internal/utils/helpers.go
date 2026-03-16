package utils

import (
	"my-ecommerce/internal/dto"
	"time"

	"github.com/gin-gonic/gin"
)

func SendSuccess(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, dto.APIResponse[interface{}]{
		Success:   true,
		Status:    status,
		Message:   message,
		Timestamp: time.Now().Format(time.RFC3339),
		Data:      data,
	})
}

func SendError(c *gin.Context, status int, err string, message string) {
	c.JSON(status, dto.ErrorResponse{
		Success: false,
		Status:  status,
		Error:   err,
		Message: message,
	})
}

const (
	RoleAdmin  uint = 1
	RoleBuyer  uint = 2
	RoleSeller uint = 3
)
