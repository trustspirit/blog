package models

import "time"

type User struct {
	ID          string    `firestore:"id" json:"id"`
	Email       string    `firestore:"email" json:"email"`
	Name        string    `firestore:"name" json:"name"`
	Picture     string    `firestore:"picture" json:"picture"`
	CreatedAt   time.Time `firestore:"createdAt" json:"createdAt"`
	LastLoginAt time.Time `firestore:"lastLoginAt" json:"lastLoginAt"`
}

type RefreshToken struct {
	Token     string    `firestore:"token" json:"token"`
	UserID    string    `firestore:"userId" json:"userId"`
	CreatedAt time.Time `firestore:"createdAt" json:"createdAt"`
}

type GoogleLoginRequest struct {
	Token string `json:"token" binding:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

type AuthResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	User         User   `json:"user"`
}

type TokenResponse struct {
	AccessToken string `json:"accessToken"`
}

type MessageResponse struct {
	Message string `json:"message"`
}
