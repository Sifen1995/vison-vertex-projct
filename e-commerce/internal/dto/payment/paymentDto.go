package dto

type ChapaInitializeRequest struct {
	Amount        float64                `json:"amount"`
	Currency      string                 `json:"currency"`
	Email         string                 `json:"email"`
	FirstName     string                 `json:"first_name"`
	LastName      string                 `json:"last_name"`
	TxRef         string                 `json:"tx_ref"` // Your unique Order ID
	CallbackURL   string                 `json:"callback_url"`
	ReturnURL     string                 `json:"return_url"`
	Customization map[string]interface{} `json:"customization"`
}

type ChapaInitializeResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
	Data    struct {
		CheckoutURL string `json:"checkout_url"`
	} `json:"data"`
}
