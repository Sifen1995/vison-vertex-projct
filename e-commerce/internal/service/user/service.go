package service

import (
	"context"
	"my-ecommerce/internal/cfg"
	dto "my-ecommerce/internal/dto/user"
	"my-ecommerce/internal/model"
	repository "my-ecommerce/internal/repository/user"

	"gorm.io/gorm"
)

type UserService interface {
	Register(ctx context.Context, req *dto.UserRegisterRequestDTO) (*model.User, int, error)
	Login(ctx context.Context, req *dto.UserLoginRequest) (string, string, int, bool, int, error)
	UpgradeToSeller(ctx context.Context, roleId uint) (string, string, int, int, error)
	SetupMFA(uctx context.Context, serID uint) (string, string, int, error)
	FinalizeMFAEnable(ctx context.Context, userID uint, code string) (string, string, int, int, error)
	GetUserById(ctx context.Context, userId uint) (*model.User, int, error)
	RefreshUserSession(ctx context.Context, userID uint, providedToken string) (string, error)
	Logout(ctx context.Context, userID uint) error
}

type UserServiceState struct {
	config   *cfg.Config
	userRepo repository.UserRepository
	roles    map[string]uint
}

func NewService(config *cfg.Config, userRepo repository.UserRepository, db *gorm.DB) UserService {

	roleMap := make(map[string]uint)
	var roles []model.Role
	db.Find(&roles)

	for _, r := range roles {
		roleMap[r.Name] = r.ID
	}
	return &UserServiceState{
		config:   config,
		userRepo: userRepo,
		roles:    roleMap,
	}
}
