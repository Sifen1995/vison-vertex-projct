package dto

type UserRegisterRequestDTO struct {
	Name  string `json:"name" binding:"required"`
	Email string `json:"email" binding:"required,email"`

	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role"`
}
type UserLoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}
type UserLoginResponce struct {
	AccessToken  string `json:"AccessToken"`
	RefreshToken string `json:"RefreshToken"`
	RoleId       int    `json:"RoleId"`
}
