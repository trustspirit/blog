package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type About struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Slug      string             `json:"slug" bson:"slug"`
	Content   string             `json:"content" bson:"content" binding:"required"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type UpdateAboutRequest struct {
	Content string `json:"content" binding:"required"`
}
