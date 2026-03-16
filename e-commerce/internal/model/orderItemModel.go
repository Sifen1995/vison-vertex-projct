package model

type OrderItem struct {
	ID              uint    `gorm:"primaryKey"`
	OrderID         uint    `gorm:"not null"`
	ProductID       uint    `gorm:"not null"`
	Quantity        int     `gorm:"not null;default:1"`
	PriceAtPurchase float64 `gorm:"type:decimal(10,2)"`
}
