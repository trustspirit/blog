package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Post struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title     string             `json:"title" bson:"title" binding:"required"`
	Content   string             `json:"content" bson:"content" binding:"required"`
	Summary   string             `json:"summary" bson:"summary" binding:"required"`
	ImageURL  string             `json:"imageUrl" bson:"imageUrl"`
	Published bool               `json:"published" bson:"published"`
	AuthorID  string             `json:"authorId" bson:"authorId" binding:"required"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type CreatePostRequest struct {
	Title     string `json:"title" binding:"required"`
	Content   string `json:"content" binding:"required"`
	Summary   string `json:"summary" binding:"required"`
	ImageURL  string `json:"imageUrl"`
	Published *bool  `json:"published"`
}

type UpdatePostRequest struct {
	Title     *string `json:"title"`
	Content   *string `json:"content"`
	Summary   *string `json:"summary"`
	ImageURL  *string `json:"imageUrl"`
	Published *bool   `json:"published"`
}

type PostsResponse struct {
	Posts   []Post `json:"posts"`
	Page    int    `json:"page"`
	Limit   int    `json:"limit"`
	HasMore bool   `json:"hasMore"`
}
