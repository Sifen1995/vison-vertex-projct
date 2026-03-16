package model

import "time"

type Order struct {
	ID         uint        `gorm:"primaryKey"`
	BuyerID    uint        `gorm:"not null"`
	TotalPrice float64     `gorm:"type:decimal(10,2)"`
	Status     string      `gorm:"default:pending"`
	Items      []OrderItem `gorm:"foreignKey:OrderID"` // One order has many items
	Payment    Payment     `gorm:"foreignKey:OrderID"` // One order has one payment record
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
