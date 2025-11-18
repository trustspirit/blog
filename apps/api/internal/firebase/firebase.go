package firebase

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"path/filepath"
	"time"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	firebase "firebase.google.com/go/v4"
	"github.com/google/uuid"
	"google.golang.org/api/option"
)

type Firebase struct {
	App           *firebase.App
	Firestore     *firestore.Client
	StorageClient *storage.Client
	Bucket        *storage.BucketHandle
	BucketName    string
}

func NewFirebase(projectID, serviceAccountJSON, storageBucket string) (*Firebase, error) {
	ctx := context.Background()

	var app *firebase.App
	var err error

	if serviceAccountJSON != "" {
		// Production mode with service account
		opt := option.WithCredentialsJSON([]byte(serviceAccountJSON))
		config := &firebase.Config{
			ProjectID:     projectID,
			StorageBucket: storageBucket,
		}
		app, err = firebase.NewApp(ctx, config, opt)
	} else {
		// Development mode
		config := &firebase.Config{
			ProjectID:     projectID,
			StorageBucket: storageBucket,
		}
		app, err = firebase.NewApp(ctx, config)
	}

	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %v", err)
	}

	firestoreClient, err := app.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("error initializing firestore: %v", err)
	}

	// Initialize Cloud Storage client directly
	var storageClient *storage.Client
	if serviceAccountJSON != "" {
		opt := option.WithCredentialsJSON([]byte(serviceAccountJSON))
		storageClient, err = storage.NewClient(ctx, opt)
	} else {
		storageClient, err = storage.NewClient(ctx)
	}
	if err != nil {
		return nil, fmt.Errorf("error initializing storage: %v", err)
	}

	bucket := storageClient.Bucket(storageBucket)

	log.Println("Connected to Firebase!")

	return &Firebase{
		App:           app,
		Firestore:     firestoreClient,
		StorageClient: storageClient,
		Bucket:        bucket,
		BucketName:    storageBucket,
	}, nil
}

func (f *Firebase) Close() error {
	if f.Firestore != nil {
		f.Firestore.Close()
	}
	if f.StorageClient != nil {
		f.StorageClient.Close()
	}
	return nil
}

// User operations
func (f *Firebase) GetUser(ctx context.Context, userID string) (map[string]interface{}, error) {
	doc, err := f.Firestore.Collection("users").Doc(userID).Get(ctx)
	if err != nil {
		return nil, err
	}
	return doc.Data(), nil
}

func (f *Firebase) CreateOrUpdateUser(ctx context.Context, userID string, data map[string]interface{}) error {
	_, err := f.Firestore.Collection("users").Doc(userID).Set(ctx, data, firestore.MergeAll)
	return err
}

// Refresh token operations
func (f *Firebase) SaveRefreshToken(ctx context.Context, userID, token string) error {
	data := map[string]interface{}{
		"token":     token,
		"userId":    userID,
		"createdAt": time.Now(),
	}
	_, err := f.Firestore.Collection("refreshTokens").Doc(userID).Set(ctx, data)
	return err
}

func (f *Firebase) GetRefreshToken(ctx context.Context, userID string) (string, error) {
	doc, err := f.Firestore.Collection("refreshTokens").Doc(userID).Get(ctx)
	if err != nil {
		return "", err
	}
	data := doc.Data()
	if token, ok := data["token"].(string); ok {
		return token, nil
	}
	return "", fmt.Errorf("token not found")
}

func (f *Firebase) DeleteRefreshToken(ctx context.Context, userID string) error {
	_, err := f.Firestore.Collection("refreshTokens").Doc(userID).Delete(ctx)
	return err
}

// Storage operations
func (f *Firebase) UploadImage(ctx context.Context, file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	// Generate unique filename
	ext := filepath.Ext(fileHeader.Filename)
	filename := fmt.Sprintf("images/%s%s", uuid.New().String(), ext)

	// Create object handle
	obj := f.Bucket.Object(filename)
	writer := obj.NewWriter(ctx)
	writer.ContentType = fileHeader.Header.Get("Content-Type")

	// Copy file content
	if _, err := io.Copy(writer, file); err != nil {
		writer.Close()
		return "", fmt.Errorf("failed to upload file: %v", err)
	}

	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close writer: %v", err)
	}

	// Make the file public
	if err := obj.ACL().Set(ctx, storage.AllUsers, storage.RoleReader); err != nil {
		return "", fmt.Errorf("failed to make file public: %v", err)
	}

	// Get public URL
	attrs, err := obj.Attrs(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to get object attributes: %v", err)
	}

	return attrs.MediaLink, nil
}

func (f *Firebase) DeleteImage(ctx context.Context, path string) error {
	obj := f.Bucket.Object(path)
	return obj.Delete(ctx)
}

// Helper to parse service account JSON
func ParseServiceAccountJSON(jsonStr string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := json.Unmarshal([]byte(jsonStr), &result)
	return result, err
}
