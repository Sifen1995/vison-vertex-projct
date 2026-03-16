package service

import (
	"context"
	"errors"
	"fmt"
	dto "my-ecommerce/internal/dto/user"
	"my-ecommerce/internal/model"
	"my-ecommerce/internal/pkg/validator"
	"net/http"
	"time"

	"bytes"
	"encoding/base64"
	"image/png"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pquerna/otp/totp"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func (s *UserServiceState) Register(ctx context.Context, req *dto.UserRegisterRequestDTO) (*model.User, int, error) {
	var roleID uint

	// 1. Check if the user provided a role in the request
	if req.Role == "" {
		// Default to Buyer (ID 2) if no role is sent
		roleID = 2
	} else {
		// 2. If they sent a role, check if it's valid (Buyer or Seller)
		val, exists := s.roles[req.Role]
		if !exists {
			// This captures "manager" or other invalid strings
			return nil, http.StatusBadRequest, errors.New("invalid role: only buyer or seller allowed")
		}
		roleID = val
	}

	_, err := s.userRepo.GetUserByEmail(ctx, req.Email)
	if err == nil {
		return nil, http.StatusBadRequest, fmt.Errorf("user with this email already exists")
	}

	// 2. If the error is anything OTHER than "Record Not Found", it's a real DB error
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, http.StatusInternalServerError, fmt.Errorf("database error: %v", err)
	}

	if !validator.IsEmailValid(req.Email) {
		return nil, http.StatusBadRequest, fmt.Errorf("invalid email format")
	}

	// 2. Validate Password Strength
	if !validator.IsPasswordStrong(req.Password) {
		return nil, http.StatusBadRequest, fmt.Errorf("password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters")
	}
	passwordHahed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, http.StatusInternalServerError, errors.New("error while hashing password")
	}

	now := time.Now()
	userModel := &model.User{
		Name:      req.Name,
		Email:     req.Email,
		RoleID:    roleID,
		Password:  string(passwordHahed),
		CreatedAt: now.Format("2006-01-02 15:04:05"),
		UpdatedAt: now,
	}

	newUser, err := s.userRepo.CreateUser(ctx, userModel)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return newUser, http.StatusCreated, nil

}

func (s *UserServiceState) Login(ctx context.Context, req *dto.UserLoginRequest) (string, string, int, bool, int, error) {
	user, err := s.userRepo.GetUserByEmail(ctx, req.Email)

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "", "", 0, false, http.StatusBadRequest, errors.New("user doesn't exist")
	}
	if err != nil {
		return "", "", 0, false, http.StatusInternalServerError, err
	}

	// 1. Verify Password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return "", "", 0, false, http.StatusUnauthorized, err
	}

	// 2. CHECK MFA STATUS
	if user.MfaEnabled {
		// Generate a "Temporary" token valid only for 5 minutes
		// We add a special claim "mfa_pending: true" so the middleware can restrict access
		tempClaims := jwt.MapClaims{
			"role_id":     user.RoleID,
			"user_id":     user.ID,
			"mfa_pending": true,
			"exp":         time.Now().Add(time.Minute * 5).Unix(),
		}

		tempTokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, tempClaims)
		tempAccessToken, err := tempTokenObj.SignedString([]byte(s.config.JwtSecret))
		if err != nil {
			return "", "", 0, false, http.StatusInternalServerError, errors.New("error generating temp token")
		}

		// Return: TempToken, Empty RefreshToken, RoleID, MfaRequired=true, Status=Accepted
		return tempAccessToken, "", int(user.RoleID), true, http.StatusAccepted, nil
	}

	// 3. PROCEED WITH NORMAL LOGIN (MFA is Off)
	claims := jwt.MapClaims{
		"role_id":     user.RoleID,
		"user_id":     user.ID,
		"mfa_pending": false,
		"exp":         time.Now().Add(time.Minute * 24).Unix(), // Fixed from 24 mins to 24 hours for better UX
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	access_token, err := token.SignedString([]byte(s.config.JwtSecret))
	if err != nil {
		return "", "", 0, false, http.StatusInternalServerError, errors.New("error while generating access token")
	}

	// Generate Refresh Token
	refresh_token_str, err := validator.GenerateRandomString(10)
	if err != nil {
		return "", "", 0, false, http.StatusInternalServerError, errors.New("error while generating refresh token")
	}

	now := time.Now()
	refreshModel := &model.RefreshToken{
		Token:     refresh_token_str,
		ExpiresAt: now.Add(time.Hour * 24 * 7),
		UserId:    user.ID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	newToken, err := s.userRepo.StoreRefreshToken(ctx, refreshModel)
	if err != nil {
		return "", "", 0, false, http.StatusInternalServerError, errors.New("error while storing token")
	}

	return access_token, newToken.Token, int(user.RoleID), false, http.StatusOK, nil
}
func (s *UserServiceState) UpgradeToSeller(ctx context.Context, userID uint) (string, string, int, int, error) {
	// 1. Define the Seller Role ID (Assuming 3)
	const SellerRoleID uint = 3

	// 2. Update the role in the database
	updatedUser, err := s.userRepo.UpdateUserRole(ctx, userID, SellerRoleID)
	if err != nil {
		return "", "", 0, http.StatusInternalServerError, err
	}

	// 3. Generate New Access Token and Refresh Token with the NEW Role ID
	// Note: Ensure your GenerateToken function accepts the new RoleID
	claims := jwt.MapClaims{
		"role_id": updatedUser.RoleID,
		"user_id": updatedUser.ID,
		"exp":     time.Now().Add(time.Minute * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	access_token, err := token.SignedString([]byte(s.config.JwtSecret))
	if err != nil {
		return "", "", 0, http.StatusInternalServerError, errors.New("error while jenerating access token")
	}
	refresh_token, err := validator.GenerateRandomString(10)
	if err != nil {
		return "", "", 0, http.StatusInternalServerError, errors.New("error while generating refresh token")
	}
	now := time.Now()

	refreshModel := &model.RefreshToken{
		Token:     refresh_token,
		ExpiresAt: now.Add(time.Hour * 24 * 7),
		UserId:    updatedUser.ID,
		CreatedAt: now,
		UpdatedAt: now,
	}
	fmt.Printf("DEBUG: Type of ExpiresAt: %T, Value: %v\n", refreshModel.ExpiresAt, refreshModel.ExpiresAt)
	newToken, err := s.userRepo.StoreRefreshToken(ctx, refreshModel)
	if err != nil {
		return "", "", 0, http.StatusInternalServerError, errors.New("error while storing token")
	}

	return access_token, newToken.Token, int(updatedUser.RoleID), http.StatusAccepted, nil
}

func (s *UserServiceState) SetupMFA(ctx context.Context, userID uint) (string, string, int, error) {
	// 1. Fetch user from DB
	user, err := s.userRepo.GetUserById(ctx, userID)
	if err != nil {
		return "", "", http.StatusBadRequest, err
	}

	// 2. Generate a new TOTP Key
	// "MyEcommerce" is the name that will show up in their Google Authenticator app
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "MyEcommerce",
		AccountName: user.Email,
	})
	if err != nil {
		return "", "", http.StatusInternalServerError, err
	}

	// 3. Save the Secret to the Database
	// Note: We don't set MfaEnabled to true yet!
	// The user must verify a code first to prove they scanned it.
	err = s.userRepo.UpdateMfaSecret(ctx, userID, key.Secret())
	if err != nil {
		return "", "", http.StatusInternalServerError, err
	}

	// 4. Convert QR Code Image to Base64 String
	// This allows the frontend to display the image easily
	var buf bytes.Buffer
	img, err := key.Image(200, 200)
	if err != nil {
		return "", "", http.StatusInternalServerError, err
	}
	png.Encode(&buf, img)
	qrBase64 := base64.StdEncoding.EncodeToString(buf.Bytes())

	return key.Secret(), qrBase64, http.StatusAccepted, nil
}
func (s *UserServiceState) FinalizeMFAEnable(ctx context.Context, userID uint, code string) (string, string, int, int, error) {
	// 1. Fetch user to get the Secret Key we generated in the 'Setup' step
	user, err := s.userRepo.GetUserById(ctx, userID)
	if err != nil {
		return "", "", 0, http.StatusInternalServerError, err
	}

	// 2. Use the TOTP library to verify the code
	// Validate customizes the check: it compares the 'code' against 'user.MfaSecret'
	valid := totp.Validate(code, user.MfaSecret)
	if !valid {
		return "", "", 0, http.StatusInternalServerError, errors.New("invalid or expired MFA code")
	}

	// 3. Code is valid! Now we officially enable MFA in the DB
	err = s.userRepo.EnableMfa(ctx, userID)
	if err != nil {
		return "", "", 0, http.StatusInternalServerError, err
	}

	claims := jwt.MapClaims{
		"role_id": user.RoleID,
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Minute * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	access_token, err := token.SignedString([]byte(s.config.JwtSecret))
	if err != nil {
		return "", "", 0, http.StatusInternalServerError, errors.New("error while jenerating access token")
	}
	refresh_token, err := validator.GenerateRandomString(10)
	if err != nil {
		return "", "", 0, http.StatusInternalServerError, errors.New("error while generating refresh token")
	}
	now := time.Now()
	refreshModel := &model.RefreshToken{
		Token:     refresh_token,
		ExpiresAt: now.Add(time.Hour * 24 * 7),
		UserId:    user.ID,
		CreatedAt: now,
		UpdatedAt: now,
	}
	newToken, err := s.userRepo.StoreRefreshToken(ctx, refreshModel)
	if err != nil {
		return "", "", 0, http.StatusInternalServerError, errors.New("error while storing token")
	}

	return access_token, newToken.Token, int(user.RoleID), http.StatusAccepted, nil
}

func (s *UserServiceState) GetUserById(ctx context.Context, userId uint) (*model.User, int, error) {
	user, err := s.userRepo.GetUserById(ctx, userId)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return user, http.StatusOK, nil
}
func (s *UserServiceState) RefreshUserSession(ctx context.Context, userID uint, providedToken string) (string, error) {
	// 1. Fetch the existing token from DB
	storedToken, err := s.userRepo.FindByToken(ctx, providedToken)
	if err != nil {
		return "", errors.New("session not found: please login again")
	}

	// 2. Security Check: Does the provided token match the database?
	if storedToken.Token != providedToken {
		return "", errors.New("invalid refresh token: security alert")
	}

	// 3. Expiration Check: Has the token expired?
	if time.Now().After(storedToken.ExpiresAt) {
		return "", errors.New("session expired: please login again")
	}

	// 4. If NOT expired, we generate new tokens (Rotate)
	// Fetch user to get current RoleID for the JWT claims
	user, err := s.userRepo.GetUserById(ctx, userID)
	if err != nil {
		return "", errors.New("user not found")
	}

	accessToken, err := s.generateTokens(user, false)
	if err != nil {
		return "", fmt.Errorf("failed to generate tokens: %w", err)
	}

	return accessToken, nil
}

func (s *UserServiceState) generateTokens(user *model.User, mfaPending bool) (string, error) {
	// 1. Calculate Expiry for the Access Token (Unix)
	var accessTokenExpiry int64
	if mfaPending {
		accessTokenExpiry = time.Now().Add(time.Minute * 5).Unix()
	} else {
		accessTokenExpiry = time.Now().Add(time.Minute * 24).Unix()
	}

	claims := jwt.MapClaims{
		"role_id":     user.RoleID,
		"user_id":     user.ID,
		"mfa_pending": mfaPending,
		"exp":         accessTokenExpiry,
	}

	tokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := tokenObj.SignedString([]byte(s.config.JwtSecret))
	if err != nil {
		return "", err
	}

	// 3. Stop here if MFA is pending
	if mfaPending {
		return accessToken, nil
	}

	// 4. Generate & Store Refresh Token

	return accessToken, nil
}
func (s *UserServiceState) Logout(ctx context.Context, userID uint) error {

	return s.userRepo.DeleteByUserID(ctx, userID)
}
