package main

import (
	"blog/api/internal/config"
	"blog/api/internal/database"
	"blog/api/internal/firebase"
	"blog/api/internal/handlers"
	"blog/api/internal/middleware"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize MongoDB
	mongoDB, err := database.NewMongoDB(cfg.MongoDBURI)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongoDB.Disconnect()

	// Initialize Firebase
	fb, err := firebase.NewFirebase(
		cfg.FirebaseProjectID,
		cfg.FirebaseServiceAccount,
		cfg.FirebaseStorageBucket,
	)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}
	defer fb.Close()

	// Initialize Gin router
	router := gin.Default()

	// CORS configuration
	corsConfig := cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}
	router.Use(cors.New(corsConfig))

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler()
	authHandler := handlers.NewAuthHandler(cfg, fb)
	postsHandler := handlers.NewPostsHandler(mongoDB)
	aboutHandler := handlers.NewAboutHandler(mongoDB)
	uploadsHandler := handlers.NewUploadsHandler(fb)

	// Health check route
	router.GET("/health", healthHandler.HealthCheck)

	// Auth routes
	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/google", authHandler.GoogleLogin)
		authRoutes.POST("/refresh", authHandler.RefreshToken)
		authRoutes.GET("/me", middleware.AuthMiddleware(cfg), authHandler.GetMe)
		authRoutes.POST("/logout", middleware.AuthMiddleware(cfg), authHandler.Logout)
	}

	// Posts routes
	postsRoutes := router.Group("/posts")
	{
		postsRoutes.GET("", postsHandler.GetPosts)
		postsRoutes.GET("/search", postsHandler.SearchPosts)
		postsRoutes.GET("/:id", postsHandler.GetPost)
		postsRoutes.GET("/admin/:id", middleware.AuthMiddleware(cfg), postsHandler.GetPostAdmin)
		postsRoutes.POST("", middleware.AuthMiddleware(cfg), postsHandler.CreatePost)
		postsRoutes.PUT("/:id", middleware.AuthMiddleware(cfg), postsHandler.UpdatePost)
		postsRoutes.DELETE("/:id", middleware.AuthMiddleware(cfg), postsHandler.DeletePost)
	}

	// About routes
	aboutRoutes := router.Group("/about")
	{
		aboutRoutes.GET("", aboutHandler.GetAbout)
		aboutRoutes.PUT("", middleware.AuthMiddleware(cfg), aboutHandler.UpdateAbout)
	}

	// Uploads routes
	uploadsRoutes := router.Group("/uploads")
	{
		uploadsRoutes.POST("/image", middleware.AuthMiddleware(cfg), uploadsHandler.UploadImage)
	}

	// Start server
	port := ":" + cfg.Port
	log.Printf("Server starting on port %s", cfg.Port)
	if err := router.Run(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
