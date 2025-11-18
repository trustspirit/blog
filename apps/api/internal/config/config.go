package config

import (
	"log"
	"os"
	"strings"
)

type Config struct {
	Port                   string
	FrontendURL            string
	JWTSecret              string
	GoogleClientID         string
	GoogleClientSecret     string
	AdminEmails            []string
	FirebaseProjectID      string
	FirebaseServiceAccount string
	FirebaseStorageBucket  string
	MongoDBURI             string
}

func Load() *Config {
	adminEmailsStr := getEnv("ADMIN_EMAILS", "")
	adminEmails := []string{}
	if adminEmailsStr != "" {
		adminEmails = strings.Split(adminEmailsStr, ",")
		for i := range adminEmails {
			adminEmails[i] = strings.TrimSpace(adminEmails[i])
		}
	}

	return &Config{
		Port:                   getEnv("PORT", "3010"),
		FrontendURL:            getEnv("FRONTEND_URL", "http://localhost:3000"),
		JWTSecret:              getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		GoogleClientID:         getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret:     getEnv("GOOGLE_CLIENT_SECRET", ""),
		AdminEmails:            adminEmails,
		FirebaseProjectID:      getEnv("FIREBASE_PROJECT_ID", ""),
		FirebaseServiceAccount: getEnv("FIREBASE_SERVICE_ACCOUNT", ""),
		FirebaseStorageBucket:  getEnv("FIREBASE_STORAGE_BUCKET", ""),
		MongoDBURI:             getEnv("MONGODB_URI", "mongodb://admin:password@localhost:27017/blog?authSource=admin"),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		if defaultValue == "" && key != "GOOGLE_CLIENT_SECRET" && key != "FIREBASE_SERVICE_ACCOUNT" {
			log.Printf("Warning: %s is not set", key)
		}
		return defaultValue
	}
	return value
}

func (c *Config) IsAdminEmail(email string) bool {
	for _, adminEmail := range c.AdminEmails {
		if adminEmail == email {
			return true
		}
	}
	return false
}
