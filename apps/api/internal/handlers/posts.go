package handlers

import (
	"blog/api/internal/database"
	"blog/api/internal/middleware"
	"blog/api/internal/models"
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PostsHandler struct {
	db *database.MongoDB
}

func NewPostsHandler(db *database.MongoDB) *PostsHandler {
	return &PostsHandler{db: db}
}

func (h *PostsHandler) GetPosts(c *gin.Context) {
	ctx := context.Background()

	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	includeDrafts := c.Query("includeDrafts") == "true"

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	skip := (page - 1) * limit

	// Build filter
	filter := bson.M{}
	if !includeDrafts {
		filter["published"] = true
	}

	// Query options
	opts := options.Find().
		SetSort(bson.D{{Key: "createdAt", Value: -1}}).
		SetSkip(int64(skip)).
		SetLimit(int64(limit + 1)) // Fetch one extra to check if there are more

	cursor, err := h.db.Posts().Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}
	defer cursor.Close(ctx)

	var posts []models.Post
	if err := cursor.All(ctx, &posts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode posts"})
		return
	}

	// Check if there are more posts
	hasMore := len(posts) > limit
	if hasMore {
		posts = posts[:limit]
	}

	c.JSON(http.StatusOK, models.PostsResponse{
		Posts:   posts,
		Page:    page,
		Limit:   limit,
		HasMore: hasMore,
	})
}

func (h *PostsHandler) GetPost(c *gin.Context) {
	ctx := context.Background()
	id := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var post models.Post
	filter := bson.M{"_id": objectID, "published": true}
	err = h.db.Posts().FindOne(ctx, filter).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

func (h *PostsHandler) GetPostAdmin(c *gin.Context) {
	ctx := context.Background()
	id := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var post models.Post
	err = h.db.Posts().FindOne(ctx, bson.M{"_id": objectID}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

func (h *PostsHandler) CreatePost(c *gin.Context) {
	ctx := context.Background()

	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	var req models.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	published := false
	if req.Published != nil {
		published = *req.Published
	}

	imageURL := ""
	if req.ImageURL != "" {
		imageURL = req.ImageURL
	}

	now := time.Now()
	post := models.Post{
		ID:        primitive.NewObjectID(),
		Title:     req.Title,
		Content:   req.Content,
		Summary:   req.Summary,
		ImageURL:  imageURL,
		Published: published,
		AuthorID:  userID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	_, err := h.db.Posts().InsertOne(ctx, post)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	c.JSON(http.StatusCreated, post)
}

func (h *PostsHandler) UpdatePost(c *gin.Context) {
	ctx := context.Background()
	id := c.Param("id")

	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Check if post exists and user is the author
	var existingPost models.Post
	err = h.db.Posts().FindOne(ctx, bson.M{"_id": objectID}).Decode(&existingPost)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	if existingPost.AuthorID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own posts"})
		return
	}

	var req models.UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Build update document
	update := bson.M{"updatedAt": time.Now()}
	if req.Title != nil {
		update["title"] = *req.Title
	}
	if req.Content != nil {
		update["content"] = *req.Content
	}
	if req.Summary != nil {
		update["summary"] = *req.Summary
	}
	if req.ImageURL != nil {
		update["imageUrl"] = *req.ImageURL
	}
	if req.Published != nil {
		update["published"] = *req.Published
	}

	result, err := h.db.Posts().UpdateOne(
		ctx,
		bson.M{"_id": objectID},
		bson.M{"$set": update},
	)
	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	// Fetch updated post
	var updatedPost models.Post
	err = h.db.Posts().FindOne(ctx, bson.M{"_id": objectID}).Decode(&updatedPost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated post"})
		return
	}

	c.JSON(http.StatusOK, updatedPost)
}

func (h *PostsHandler) DeletePost(c *gin.Context) {
	ctx := context.Background()
	id := c.Param("id")

	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Check if post exists and user is the author
	var existingPost models.Post
	err = h.db.Posts().FindOne(ctx, bson.M{"_id": objectID}).Decode(&existingPost)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	if existingPost.AuthorID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own posts"})
		return
	}

	result, err := h.db.Posts().DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil || result.DeletedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	c.JSON(http.StatusOK, models.MessageResponse{
		Message: "Post deleted successfully",
	})
}
