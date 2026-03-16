package model

import "time"

type Payment struct {
	ID            uint      `gorm:"primaryKey"`
	OrderID       uint      `gorm:"not null"`
	TransactionID *string   `gorm:"type:varchar(100);unique"` // This will store the Stripe PaymentIntent ID
	Amount        float64   `gorm:"type:decimal(10,2);not null"`
	Provider      string    `gorm:"type:varchar(20)"`                   // e.g., "stripe"
	Status        string    `gorm:"type:varchar(20);default:'pending'"` // pending, succeeded, failed
	CreatedAt     time.Time `gorm:"autoCreateTime"`
}
