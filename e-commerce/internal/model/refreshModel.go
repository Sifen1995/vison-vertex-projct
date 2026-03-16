package model

import "time"

type RefreshToken struct {
	ID        uint      `gorm:"primaryKey" json:"ID"`
	UserId    uint      `gorm:"not null" json:"RoleID"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"Created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"Updated_at"`
	Token     string    `gorm:"size:255;not null" json:"Token"`
	ExpiresAt time.Time `gorm:"column:expires_at;type:timestamptz;not null"  json:"ExpiresAt"`
}
