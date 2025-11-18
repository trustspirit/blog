package handlers

import (
	"blog/api/internal/config"
	"blog/api/internal/firebase"
	"blog/api/internal/middleware"
	"blog/api/internal/models"
	"blog/api/pkg/utils"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
)

type AuthHandler struct {
	cfg      *config.Config
	firebase *firebase.Firebase
}

func NewAuthHandler(cfg *config.Config, fb *firebase.Firebase) *AuthHandler {
	return &AuthHandler{
		cfg:      cfg,
		firebase: fb,
	}
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	var req models.GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()

	// Validate Google token
	payload, err := idtoken.Validate(ctx, req.Token, h.cfg.GoogleClientID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google token"})
		return
	}

	email := payload.Claims["email"].(string)
	name, _ := payload.Claims["name"].(string)
	picture, _ := payload.Claims["picture"].(string)

	// Check if user is admin
	if !h.cfg.IsAdminEmail(email) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admin users can log in"})
		return
	}

	userID := payload.Subject

	// Create or update user in Firestore
	userData := map[string]interface{}{
		"email":       email,
		"name":        name,
		"picture":     picture,
		"lastLoginAt": time.Now(),
	}

	// Check if user exists
	existingUser, err := h.firebase.GetUser(ctx, userID)
	if err != nil || existingUser == nil {
		// New user
		userData["createdAt"] = time.Now()
	}

	err = h.firebase.CreateOrUpdateUser(ctx, userID, userData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create/update user"})
		return
	}

	// Generate JWT tokens
	accessToken, err := utils.GenerateAccessToken(userID, email, h.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(userID, email, h.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	// Save refresh token to Firestore
	err = h.firebase.SaveRefreshToken(ctx, userID, refreshToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save refresh token"})
		return
	}

	// Get user data for response
	user := models.User{
		ID:      userID,
		Email:   email,
		Name:    name,
		Picture: picture,
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req models.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate refresh token
	claims, err := utils.ValidateToken(req.RefreshToken, h.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	ctx := context.Background()

	// Check if refresh token exists in Firestore
	storedToken, err := h.firebase.GetRefreshToken(ctx, claims.UserID)
	if err != nil || storedToken != req.RefreshToken {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	// Generate new access token
	accessToken, err := utils.GenerateAccessToken(claims.UserID, claims.Email, h.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	c.JSON(http.StatusOK, models.TokenResponse{
		AccessToken: accessToken,
	})
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	ctx := context.Background()

	// Get user from Firestore
	userData, err := h.firebase.GetUser(ctx, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user := models.User{
		ID:      userID,
		Email:   userData["email"].(string),
		Name:    userData["name"].(string),
		Picture: userData["picture"].(string),
	}

	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	ctx := context.Background()

	// Delete refresh token from Firestore
	err := h.firebase.DeleteRefreshToken(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to logout"})
		return
	}

	c.JSON(http.StatusOK, models.MessageResponse{
		Message: "Logged out successfully",
	})
}
