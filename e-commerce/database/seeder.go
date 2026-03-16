package database

import (
	"fmt"
	"my-ecommerce/internal/model"

	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedDatabase(db *gorm.DB) error {
	// 1. Define the roles we need
	roles := []model.Role{
		{ID: 1, Name: "admin"},
		{ID: 2, Name: "user"},
	}

	// 2. Seed Roles using "FirstOrCreate"
	// This ensures we don't get errors if roles already exist
	for _, role := range roles {
		if err := db.FirstOrCreate(&role, model.Role{ID: role.ID}).Error; err != nil {
			return fmt.Errorf("could not seed role %s: %v", role.Name, err)
		}
	}

	// 3. Check if Admin exists
	var count int64
	db.Model(&model.User{}).Where("email = ?", "admin@ecommerce.com").Count(&count)

	if count == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), 10)

		admin := model.User{
			Email:     "admin@ecommerce.com",
			Name:      "admin",
			Password:  string(hashedPassword),
			RoleID:    1, // Now we know ID 1 definitely exists!
			CreatedAt: time.Now().Format("2006-01-02 15:04:05"),
			UpdatedAt: time.Now(),
		}

		if err := db.Create(&admin).Error; err != nil {
			return fmt.Errorf("could not seed admin user: %v", err)
		}
		fmt.Println("✅ Admin user seeded successfully")
	}

	return nil
}
