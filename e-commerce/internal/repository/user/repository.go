package repository

import (
	"context"
	"my-ecommerce/internal/cfg"
	"my-ecommerce/internal/model"

	"gorm.io/gorm"
)

type UserRepository interface {
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)
	CreateUser(ctx context.Context, model *model.User) (*model.User, error)
	StoreRefreshToken(ctx context.Context, m *model.RefreshToken) (*model.RefreshToken, error)
	UpdateUserRole(ctx context.Context, userID uint, newRoleID uint) (*model.User, error)
	GetUserById(ctx context.Context, userId uint) (*model.User, error)
	UpdateMfaSecret(ctx context.Context, userID uint, secret string) error
	EnableMfa(ctx context.Context, userID uint) error
	FindByToken(ctx context.Context, token string) (*model.RefreshToken, error)
	DeleteToken(ctx context.Context, token string) error
	DeleteByUserID(ctx context.Context, userID uint) error
}
type UserState struct {
	db     *gorm.DB // Changed from internalps.DB to *gorm.DB
	config *cfg.Config
}

// NewUserRepository initializes the repository with the GORM instance
func NewUserRepository(db *gorm.DB, config *cfg.Config) UserRepository {
	return &UserState{
		db:     db,
		config: config,
	}
}
