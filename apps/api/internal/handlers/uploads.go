package handlers

import (
	"blog/api/internal/firebase"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UploadsHandler struct {
	firebase *firebase.Firebase
}

func NewUploadsHandler(fb *firebase.Firebase) *UploadsHandler {
	return &UploadsHandler{firebase: fb}
}

func (h *UploadsHandler) UploadImage(c *gin.Context) {
	ctx := context.Background()

	// Get file from form
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}
	defer file.Close()

	// Validate file size (max 5MB)
	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 5MB"})
		return
	}

	// Validate file type
	contentType := header.Header.Get("Content-Type")
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}

	if !allowedTypes[contentType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Allowed types: jpeg, jpg, png, gif, webp"})
		return
	}

	// Upload to Firebase Storage
	url, err := h.firebase.UploadImage(ctx, file, header)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": url})
}
