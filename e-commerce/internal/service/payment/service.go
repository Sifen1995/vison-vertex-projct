package service

import (
	"context"
	"errors"
	"fmt"
	"my-ecommerce/internal/model"
	orderRepo "my-ecommerce/internal/repository/orders"
	payRepo "my-ecommerce/internal/repository/payment"
	"os"

	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/paymentintent"
)

type IPaymentService interface {
	CreateCheckoutSession(ctx context.Context, orderID uint, userID uint) (string, error) //stripe
	FinalizePayment(ctx context.Context, orderID string, txnID string) error              //stripe
	InitializeChapaPayment(ctx context.Context, orderID string, amount float64, userEmail string) (string, error)
	ProcessChapaWebhook(ctx context.Context, signature string, body []byte) error
}
type PaymentService struct {
	paymentRepo payRepo.PaymentRepoInt
	orderRepo   orderRepo.OrderRepository
}

func NewPaymentService(pRepo payRepo.PaymentRepoInt, oRepo orderRepo.OrderRepository) IPaymentService {
	return &PaymentService{
		paymentRepo: pRepo,
		orderRepo:   oRepo}
}
func (s *PaymentService) CreateCheckoutSession(ctx context.Context, orderID uint, userID uint) (string, error) {
	// 1. Validate Order
	// We must ensure the order exists AND belongs to the person trying to pay
	var order *model.Order
	// (Assume you have a GetOrder method in your orderRepo)
	order, err := s.orderRepo.GetOneOrder(ctx, orderID)
	if err != nil || order.BuyerID != userID {
		return "", errors.New("order not found or unauthorized")
	}

	// 2. Stripe Configuration
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// 3. Create Stripe PaymentIntent
	// Note: Stripe uses the smallest currency unit (cents). $10.00 = 1000params := &stripe.PaymentIntentParams{
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(order.TotalPrice * 100)),
		Currency: stripe.String(string(stripe.CurrencyUSD)),
	}
	// This is how Stripe handles metadata
	params.AddMetadata("order_id", fmt.Sprintf("%d", orderID))
	intent, err := paymentintent.New(params)
	if err != nil {
		return "", err
	}

	// 4. Record the "Pending" Payment in our Database
	paymentRecord := &model.Payment{
		OrderID:       order.ID,
		TransactionID: &intent.ID, // e.g., "pi_3N..."
		Amount:        order.TotalPrice,
		Provider:      "stripe",
		Status:        "pending",
	}

	if err := s.paymentRepo.SavePayment(ctx, paymentRecord); err != nil {
		return "", err
	}

	// 5. Return ClientSecret
	// The Frontend uses this secret to open the Stripe Credit Card modal
	return intent.ClientSecret, nil
}
func (s *PaymentService) FinalizePayment(ctx context.Context, orderID string, txnID string) error {
	// Business logic could go here (e.g., Check if the order was already cancelled)

	// Call the repository to handle the DB transaction

	err := s.paymentRepo.FinalizePayment(ctx, orderID, txnID)
	if err != nil {
		return fmt.Errorf("failed to finalize payment in database: %w", err)
	}

	return nil
}
