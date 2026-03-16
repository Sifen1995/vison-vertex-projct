package handler

import (
	"encoding/json"
	"io"
	"log"
	"my-ecommerce/internal/utils"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/webhook"
)

// @Summary      Stripe webhook
// @Description  Receive and process Stripe webhook events
// @Tags         webhooks
// @Accept       json
// @Produce      json
// @Router       /payments/stripe-webhook [post]
func (h *PayHandel) StripeWebhook(c *gin.Context) {
	// 1. Read the raw body (Required for signature verification)
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Read body failed"})
		return
	}

	// 2. Verify Signature
	// For Docker/CLI, ensure STRIPE_WEBHOOK_SECRET is the one from 'docker logs stripe_cli'
	sig := c.GetHeader("Stripe-Signature")
	secret := os.Getenv("STRIPE_WEBHOOK_SECRET")

	// Use Options to ignore the API version mismatch
	event, err := webhook.ConstructEventWithOptions(
		payload,
		sig,
		secret,
		webhook.ConstructEventOptions{
			IgnoreAPIVersionMismatch: true,
		},
	)
	if err != nil {
		// THIS LOG WILL TELL YOU EXACTLY WHAT IS WRONG
		log.Printf("Stripe Webhook Error: %v", err)
		c.Status(http.StatusBadRequest)
		return
	}

	// 3. Handle specific event
	if event.Type == "payment_intent.succeeded" {
		var intent stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &intent); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unmarshal failed"})
			return
		}

		orderID := intent.Metadata["order_id"]

		// SECURITY CHECK: Verify the amount matches your DB (as we did for Chapa)
		// You should fetch the order and compare intent.Amount vs order.Amount

		err = h.paymetService.FinalizePayment(c.Request.Context(), orderID, intent.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Finalize failed"})
			return
		}
	}

	c.Status(http.StatusOK)
}

// @Summary      Chapa webhook
// @Description  Receive and process Chapa webhook events and redirect callbacks
// @Tags         webhooks
// @Produce      json
// @Router       /payments/chapa-webhook [post]
// @Router       /payments/chapa-webhook [get]
func (h *PayHandel) ChapaWebhook(c *gin.Context) {

	log.Println("========== CHAPA WEBHOOK HIT ==========")
	log.Println("Request Method:", c.Request.Method)

	// Log headers
	log.Println("Headers:")
	for k, v := range c.Request.Header {
		log.Println(k, v)
	}

	// Log query params
	log.Println("Query Params:")
	for k, v := range c.Request.URL.Query() {
		log.Println(k, v)
	}

	// 1. Handle GET redirect from Chapa
	if c.Request.Method == "GET" {

		txRef := c.Query("trx_ref")
		status := c.Query("status")
		chapaRef := c.Query("ref_id")

		log.Println("Redirect Flow Detected")
		log.Println("trx_ref:", txRef)
		log.Println("status:", status)
		log.Println("ref_id:", chapaRef)
		parts := strings.Split(txRef, "-")
		orderID := parts[0]

		log.Println("Extracted OrderID:", orderID)

		if status == "success" {

			log.Println("Status success via redirect, calling FinalizePayment")

			err := h.paymetService.FinalizePayment(c.Request.Context(), orderID, chapaRef)
			if err != nil {
				log.Println("FinalizePayment error:", err)
				c.JSON(500, gin.H{"error": "Update failed"})
				return
			}

			log.Println("FinalizePayment successful via redirect")

			c.JSON(200, gin.H{"message": "Payment verified via redirect"})
			return
		}

		log.Println("Redirect received but status not success:", status)
	}

	// 2. Get signature header
	signature := c.GetHeader("Chapa-Signature")

	log.Println("Chapa-Signature Header:", signature)

	if signature == "" {
		log.Println("Missing Chapa-Signature header")
		utils.SendError(c, http.StatusUnauthorized, "Missing signature", "No Chapa-Signature header provided")
		return
	}

	// 3. Read raw body
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Println("Error reading webhook body:", err)
		utils.SendError(c, http.StatusInternalServerError, "Read error", "Could not read webhook body")
		return
	}

	log.Println("Raw Webhook Body:", string(body))

	// 4. Process webhook
	err = h.paymetService.ProcessChapaWebhook(c.Request.Context(), signature, body)
	if err != nil {

		log.Println("Webhook processing failed:", err)

		utils.SendError(c, http.StatusBadRequest, "Webhook failed", err.Error())
		return
	}

	log.Println("Webhook processed successfully")

	// 5. Respond OK
	c.Status(http.StatusOK)
}
