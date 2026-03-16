package repository

import (
	"context"
	"log"
	"my-ecommerce/internal/cfg"
	"my-ecommerce/internal/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PaymentRepoInt interface {
	SavePayment(ctx context.Context, p *model.Payment) error
	FinalizePayment(ctx context.Context, orderID string, txnID string) error
}
type PaymentRepo struct {
	db     *gorm.DB
	config *cfg.Config
}

func NewPaymentRepo(db *gorm.DB, config *cfg.Config) PaymentRepoInt {
	return &PaymentRepo{db: db,
		config: config}

}

func (r *PaymentRepo) SavePayment(ctx context.Context, p *model.Payment) error {
	db := r.db.WithContext(ctx).Model(&model.Payment{})

	// If TransactionID is empty (like for Chapa init), tell GORM NOT to touch that column.
	// This prevents GORM from trying to insert an empty string into a unique column.
	if p.TransactionID == nil || *p.TransactionID == "" {
		db = db.Omit("transaction_id")
	}

	// Upsert Logic:
	// If OrderID exists, UPDATE the other fields. If not, INSERT.
	return db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "order_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"amount", "provider", "status"}),
	}).Create(p).Error
}
func (r *PaymentRepo) FinalizePayment(ctx context.Context, orderID string, txnID string) error {

	log.Println("========== FINALIZE PAYMENT REPOSITORY ==========")
	log.Println("OrderID:", orderID)
	log.Println("TransactionID:", txnID)

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {

		log.Println("Starting DB Transaction")

		// 1. Update Order
		log.Println("Updating Order status to paid")

		result := tx.Model(&model.Order{}).
			Where("id = ?", orderID).
			Update("status", "paid")

		if result.Error != nil {
			log.Println("Order update error:", result.Error)
			return result.Error
		}

		log.Println("Order rows affected:", result.RowsAffected)

		// 2. Update Payment record
		log.Println("Updating Payment record")

		paymentResult := tx.Model(&model.Payment{}).
			Where("order_id = ?", orderID).
			Updates(model.Payment{
				TransactionID: &txnID,
				Status:        "succeeded",
			})

		if paymentResult.Error != nil {
			log.Println("Payment update error:", paymentResult.Error)
			return paymentResult.Error
		}

		log.Println("Payment rows affected:", paymentResult.RowsAffected)

		log.Println("DB Transaction completed successfully")

		return nil
	})
}
