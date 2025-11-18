package handlers

import (
	"blog/api/internal/database"
	"blog/api/internal/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AboutHandler struct {
	db *database.MongoDB
}

func NewAboutHandler(db *database.MongoDB) *AboutHandler {
	return &AboutHandler{db: db}
}

func (h *AboutHandler) GetAbout(c *gin.Context) {
	ctx := context.Background()

	var about models.About
	err := h.db.Abouts().FindOne(ctx, bson.M{"slug": "main"}).Decode(&about)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "About page not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch about page"})
		return
	}

	c.JSON(http.StatusOK, about)
}

func (h *AboutHandler) UpdateAbout(c *gin.Context) {
	ctx := context.Background()

	var req models.UpdateAboutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	update := bson.M{
		"slug":      "main",
		"content":   req.Content,
		"updatedAt": now,
	}

	opts := options.FindOneAndUpdate().
		SetUpsert(true).
		SetReturnDocument(options.After)

	var about models.About
	err := h.db.Abouts().FindOneAndUpdate(
		ctx,
		bson.M{"slug": "main"},
		bson.M{"$set": update},
		opts,
	).Decode(&about)

	if err != nil {
		// If it's a new document, create it with an ID
		if err == mongo.ErrNoDocuments {
			about = models.About{
				ID:        primitive.NewObjectID(),
				Slug:      "main",
				Content:   req.Content,
				UpdatedAt: now,
			}
			_, err = h.db.Abouts().InsertOne(ctx, about)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create about page"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update about page"})
			return
		}
	}

	c.JSON(http.StatusOK, about)
}
