package dto

// APIResponse is the standard wrapper for all successful responses
type APIResponse[T any] struct {
	Success   bool   `json:"success"`
	Status    int    `json:"status"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
	Data      T      `json:"data,omitempty"`
}

// ErrorResponse is the standard wrapper for all failure responses
type ErrorResponse struct {
	Success bool   `json:"success"`
	Status  int    `json:"status"`
	Error   string `json:"error"`
	Message string `json:"message"`
}
