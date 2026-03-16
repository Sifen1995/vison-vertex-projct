package model

type Role struct {
	ID   uint   `gorm:"primaryKey" json:"ID"`
	Name string `gorm:"size:50;unique;not null" json:"Name"` // e.g., "admin", "customer"
}
