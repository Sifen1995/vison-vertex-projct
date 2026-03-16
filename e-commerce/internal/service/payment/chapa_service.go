package service

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	dto "my-ecommerce/internal/dto/payment"
	"my-ecommerce/internal/model"
	"net/http"
	"strconv"
	"strings"
	"time"

	"os"
)

func (s *PaymentService) InitializeChapaPayment(ctx context.Context, orderID string, amount float64, userEmail string) (string, error) {
	// 1. Convert orderID string to uint (assuming your model uses uint for order_id)
	uOrderID, err := strconv.ParseUint(orderID, 10, 32)
	if err != nil {
		return "", fmt.Errorf("invalid order id format: %v", err)
	}
	oreder, err := s.orderRepo.GetOneOrder(ctx, uint(uOrderID))
	if err != nil {
		return "", fmt.Errorf("can't get the order")
	}
	if amount != oreder.TotalPrice {
		return "", fmt.Errorf("pleas provide the requierd amout current amount is not equal to total price")
	}
	// 2. Prepare the Payment Model for the Database
	// We set status to 'pending' and the provider to 'chapa'
	pendingPayment := &model.Payment{
		OrderID:  uint(uOrderID),
		Amount:   amount,
		Status:   "pending",
		Provider: "chapa",
		// transaction_id is empty for now; we'll update it in the Webhook later
	}

	// 3. Save to DB using your repository
	err = s.paymentRepo.SavePayment(ctx, pendingPayment)
	if err != nil {
		// Log this: it might fail if a record with this OrderID already exists
		return "", fmt.Errorf("failed to record pending payment: %v", err)
	}
	uniqueRef := fmt.Sprintf("%s-%d", orderID, time.Now().Unix())
	// 4. Prepare the Chapa Payload
	payload := dto.ChapaInitializeRequest{
		Amount:      amount,
		Currency:    "ETB",
		Email:       userEmail,
		TxRef:       uniqueRef,
		CallbackURL: "https://asyllabic-rayne-unrodded.ngrok-free.dev/api/payments/chapa-webhook",
		ReturnURL:   "https://postman-echo.com/get",
	}

	body, _ := json.Marshal(payload)

	// 5. Create and Send Request to Chapa
	req, _ := http.NewRequestWithContext(ctx, "POST", os.Getenv("CHAPA_API_URL"), bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+os.Getenv("CHAPA_SECRET_KEY"))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// 6. Parse Response
	var chapaResp dto.ChapaInitializeResponse
	if err := json.NewDecoder(resp.Body).Decode(&chapaResp); err != nil {
		return "", err
	}

	if chapaResp.Status != "success" {
		return "", errors.New("chapa initialization failed: " + chapaResp.Message)
	}

	return chapaResp.Data.CheckoutURL, nil
}
func (s *PaymentService) ProcessChapaWebhook(ctx context.Context, signature string, body []byte) error {

	log.Println("========== PROCESS CHAPA WEBHOOK ==========")

	// 1. Validate Signature

	secret := os.Getenv("CHAPA_SECRET_KEY")

	log.Println("Loaded CHAPA_SECRET_KEY")

	h := hmac.New(sha256.New, []byte(secret))
	h.Write(body)
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	log.Println("Expected Signature:", expectedSignature)
	log.Println("Received Signature:", signature)

	if signature != expectedSignature {
		log.Println("Signature validation FAILED")
		return errors.New("invalid signature: unauthorized webhook attempt")
	}

	log.Println("Signature validation PASSED")

	// 2. Parse payload

	var payload struct {
		Status string `json:"status"`
		TxRef  string `json:"trx_ref"`
		RefID  string `json:"ref_id"`
	}

	if err := json.Unmarshal(body, &payload); err != nil {
		log.Println("JSON Unmarshal Error:", err)
		return err
	}

	log.Println("Parsed Payload:")
	log.Println("Status:", payload.Status)
	log.Println("TxRef:", payload.TxRef)
	log.Println("RefID:", payload.RefID)

	// Extract orderID
	parts := strings.Split(payload.TxRef, "-")

	log.Println("Split TxRef:", parts)

	if len(parts) == 0 {
		log.Println("Invalid trx_ref format")
		return errors.New("invalid trx_ref format")
	}

	orderID := parts[0]

	log.Println("Extracted OrderID:", orderID)

	// 3. Finalize payment if success
	if payload.Status == "success" {

		log.Println("Payment status SUCCESS, calling repository FinalizePayment")

		err := s.paymentRepo.FinalizePayment(ctx, orderID, payload.RefID)

		if err != nil {
			log.Println("Repository FinalizePayment error:", err)
			return err
		}

		log.Println("Repository FinalizePayment completed successfully")

		return nil
	}

	log.Println("Payment status not success, skipping DB update")

	return nil
}
