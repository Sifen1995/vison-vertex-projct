package model

import "time"

type Product struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Name        string  `gorm:"not null" json:"name"`
	Description string  `json:"description"`
	Price       float64 `gorm:"type:decimal(10,2);not null" json:"price"`

	// Your custom column for incrementing same products
	Count int `gorm:"default:1;not null" json:"count"`

	// Foreign Key: Category
	CategoryID uint     `gorm:"not null" json:"category_id"`
	Category   Category `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"category,omitempty"`

	// Foreign Key: User (the owner/seller)
	SellerID uint `gorm:"not null"`

	// Standard GORM timestamps
	CreatedAt time.Time `gorm:"autoCreateTime" json:"Created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"Updated_at"`

	ApprovalStatus string `gorm:"not null;default:pending" json:"Approval_Status"`
	SaleStatus     string `gorm:"not null;default:on_sale" json:"Sale_Status"`

	Products []Product `gorm:"foreignKey:SellerID"`
	Orders   []Order   `gorm:"foreignKey:BuyerID"`
}
