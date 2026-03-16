package handler

import (
	dto "my-ecommerce/internal/dto/user"
	"my-ecommerce/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary      Register a new user
// @Description  Create a new user account in the system
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        payload  body      dto.UserRegisterRequestDTO  true  "User Registration Data"
// @Success      201      {object}  object{success=bool,status=int,message=string,timestamp=string,data=object{}}
// @Failure      400      {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500      {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /auth/register [post]
func (h *UserHandler) Register(c *gin.Context) {
	var (
		ctx = c.Request.Context()
		req dto.UserRegisterRequestDTO
	)

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), "Invalid request data")
		return
	}

	newUser, status, err := h.userService.Register(ctx, &req)
	if err != nil {
		utils.SendError(c, status, err.Error(), "can not register a user")
		return
	}

	utils.SendSuccess(c, status, "User created", newUser)
}

// @Summary      User Login
// @Description  Authenticate user and return JWT access token and refresh token
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        payload  body      dto.UserLoginRequest  true  "Login Credentials"
// @Success      200  {object} dto.UserLoginResponce
// @Failure      400      {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      401      {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500      {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /auth/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	var (
		ctx = c.Request.Context()
		req dto.UserLoginRequest
	)
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), "Invalid request data")
		return
	}

	// Now receiving 6 values from the service: ac, rt, role_id, mfaRequired, status, err
	ac, rt, role_id, mfaRequired, status, err := h.userService.Login(ctx, &req)
	if err != nil {
		utils.SendError(c, status, "error while logging user in", err.Error())
		return
	}

	// LOGIC: If MFA is required, we don't send the normal response.
	// We send a 202 Accepted status and the temp_token.
	if mfaRequired {
		utils.SendSuccess(c, http.StatusAccepted, "MFA_REQUIRED", gin.H{
			"temp_token": ac,
			"role_id":    role_id,
		})
		return
	}

	// Standard Login Response (MFA was disabled)
	responseData := dto.UserLoginResponce{
		AccessToken:  ac,
		RefreshToken: rt,
		RoleId:       role_id,
	}
	utils.SendSuccess(c, status, "user logged in", responseData)
}

// @Summary      Upgrade user to seller
// @Description  Upgrade the authenticated user to a seller role
// @Tags         auth
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Success      200  {object} dto.UserLoginResponce
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /auth/upgrade-to-seller [patch]
func (h *UserHandler) Upgrade(c *gin.Context) {
	// Get current ID from the Buyer's token
	uid, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, 401, "Unauthorized", "User not found in session")
		return
	}
	userID := uint(uid.(float64))

	access, refresh, role, status, err := h.userService.UpgradeToSeller(c.Request.Context(), userID)
	if err != nil {
		utils.SendError(c, status, "Upgrade failed", err.Error())
		return
	}
	responseData := dto.UserLoginResponce{
		AccessToken:  access,
		RefreshToken: refresh,
		RoleId:       role,
	}

	utils.SendSuccess(c, status, "Upgraded to Seller successfully", responseData)
}

// @Summary      Initiate MFA setup
// @Description  Generate MFA secret and QR code for the authenticated user
// @Tags         auth
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Success      200  {object}  object{qr_code=string,secret=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /auth/mfa/setup [post]
func (h *UserHandler) EnableMFA(c *gin.Context) {
	// 1. Get User ID from JWT Context
	uid, _ := c.Get("user_id")
	userID := uint(uid.(float64))

	// 2. Call Service
	secret, qrCode, status, err := h.userService.SetupMFA(c.Request.Context(), userID)
	if err != nil {
		utils.SendError(c, status, "Failed to setup MFA", err.Error())
		return
	}

	// 3. Return the QR code (Base64) and the raw Secret
	// (The raw secret is a backup in case their camera is broken)
	utils.SendSuccess(c, http.StatusOK, "MFA Setup initiated", gin.H{
		"qr_code": "data:image/png;base64," + qrCode,
		"secret":  secret,
	})
}

// @Summary      Verify MFA code and enable MFA
// @Description  Verify the provided MFA code and enable MFA for the authenticated user
// @Tags         auth
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        payload  body      object{code=string}  true  "6-digit verification code"
// @Success      200  {object}  object{access_token=string,refresh_token=string,user_role=int}
// @Failure      400  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /auth/mfa/verify [post]
func (h *UserHandler) VerifyAndEnableMFA(c *gin.Context) {
	// 1. Get User ID from JWT Context
	uid, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", "User context missing")
		return
	}
	userID := uint(uid.(float64))

	// 2. Parse the 6-digit code from the request body
	var input struct {
		Code string `json:"code" binding:"required,len=6"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid Input", "6-digit code is required")
		return
	}

	// 3. Call Service to verify the code and "Flip the Switch"
	access, refresh, role, status, err := h.userService.FinalizeMFAEnable(c.Request.Context(), userID, input.Code)
	if err != nil {
		// If the code is wrong or expired, we return an error
		utils.SendError(c, status, "MFA Verification Failed", err.Error())
		return
	}

	utils.SendSuccess(c, http.StatusOK, "MFA is now enabled for your account", gin.H{
		"access_token":  access,
		"refresh_token": refresh,
		"user_role":     role,
	})
}

// @Summary      Refresh access token
// @Description  Generate a new access token using a valid refresh token
// @Tags         auth
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        payload  body      object{refresh_token=string}  true  "Refresh token"
// @Success      200  {object}  object{access_token=string}
// @Failure      400  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /auth/refresh [post]
func (h *UserHandler) Refresh(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	uid, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", "User context missing")
		return
	}
	userID := uint(uid.(float64))
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID and Refresh Token required"})
		return
	}

	accessToken, err := h.userService.RefreshUserSession(c.Request.Context(), userID, req.RefreshToken)
	if err != nil {
		// If it's expired or invalid, the user must log in again
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": accessToken,
	})
}

// @Summary      Logout user
// @Description  Invalidate the current user session and refresh token
// @Tags         auth
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  object{message=string}
// @Failure      401  {object}  object{success=bool,status=int,error=string,message=string}
// @Failure      500  {object}  object{success=bool,status=int,error=string,message=string}
// @Router       /auth/logout [post]
func (h *UserHandler) Logout(c *gin.Context) {

	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var userID uint
	switch v := val.(type) {
	case float64:
		userID = uint(v)
	case uint:
		userID = v
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id type"})
		return
	}

	err := h.userService.Logout(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to logout"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}
