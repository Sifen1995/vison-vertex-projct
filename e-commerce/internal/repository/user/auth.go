package repository

import (
	"context"
	"my-ecommerce/internal/model"
	"time"

	"errors"

	"gorm.io/gorm/clause"
)

func (r *UserState) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserState) CreateUser(ctx context.Context, m *model.User) (*model.User, error) {
	err := r.db.WithContext(ctx).Create(m).Error

	if err != nil {
		return nil, err
	}

	return m, nil
}

func (r *UserState) StoreRefreshToken(ctx context.Context, m *model.RefreshToken) (*model.RefreshToken, error) {
	err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "user_id"}},
		// Use AssignmentColumns to let GORM map the struct fields correctly
		DoUpdates: clause.AssignmentColumns([]string{"token", "expires_at", "updated_at"}),
	}).Create(m).Error

	if err != nil {
		return nil, err
	}
	return m, nil
}
func (r *UserState) UpdateUserRole(ctx context.Context, userID uint, newRoleID uint) (*model.User, error) {
	var user model.User

	// 1. Use a struct or specific field updates to ensure types are preserved
	err := r.db.WithContext(ctx).Model(&user).
		Where("id = ?", userID).
		Updates(model.User{
			RoleID:           newRoleID,
			IsSellerVerified: true,
			UpdatedAt:        time.Now(), // GORM handles this correctly as a timestamp
		}).Error

	if err != nil {
		return nil, err
	}

	err = r.db.WithContext(ctx).First(&user, userID).Error
	return &user, err
}
func (r *UserState) GetUserById(ctx context.Context, userId uint) (*model.User, error) {
	var user model.User

	err := r.db.WithContext(ctx).Where("id=?", userId).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserState) UpdateMfaSecret(ctx context.Context, userID uint, secret string) error {
	// We use Model(&model.User{}) to tell GORM which table to target,
	// then we use Where to find the specific user,
	// and finally Update to change only the mfa_secret column.
	result := r.db.WithContext(ctx).Model(&model.User{}).
		Where("id = ?", userID).
		Update("mfa_secret", secret)

	if result.Error != nil {
		return result.Error
	}

	// It's good practice to check if a row was actually found
	if result.RowsAffected == 0 {
		return errors.New("user not found")
	}

	return nil
}
func (r *UserState) EnableMfa(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).Model(&model.User{}).
		Where("id = ?", userID).
		Update("mfa_enabled", true).Error
}
func (r UserState) FindByToken(ctx context.Context, token string) (*model.RefreshToken, error) {
	var rt model.RefreshToken
	err := r.db.WithContext(ctx).Where("token = ?", token).First(&rt).Error
	return &rt, err
}
func (r *UserState) DeleteByUserID(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&model.RefreshToken{}).Error
}

func (r *UserState) DeleteToken(ctx context.Context, token string) error {
	return r.db.WithContext(ctx).Where("token = ?", token).Delete(&model.RefreshToken{}).Error
}
