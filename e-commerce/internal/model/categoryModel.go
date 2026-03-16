package model

type Category struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `gorm:"uniqueIndex;not null" json:"name"`
	CreatedAt string `json:"created_at"`

	// Has Many relationship: A category can have many products
	Products []Product `gorm:"foreignKey:CategoryID" json:"products,omitempty"`
}
