package model

import "time"

type User struct {
	ID               uint      `gorm:"primaryKey" json:"ID"`
	Name             string    `gorm:"size:255;not null" json:"Name"`
	Email            string    `gorm:"size:255;unique;not null" json:"Email"`
	Password         string    `gorm:"size:255;not null" json:"-"`
	RoleID           uint      `gorm:"not null;default:2" json:"RoleID"` // e.g., "customer", "admin"
	CreatedAt        string    `gorm:"autoCreateTime" json:"Created_at"`
	UpdatedAt        time.Time `gorm:"autoUpdateTime" json:"Updated_at"`
	IsSellerVerified bool      `gorm:"default:false"`
	MfaSecret        string    `gorm:"size:255;unique;not null" json:"MfaSecret"`
	MfaEnabled       bool      `gorm:"default:false"`
	Products         []Product `gorm:"foreignKey:SellerID"`
	Orders           []Order   `gorm:"foreignKey:BuyerID"`
}
