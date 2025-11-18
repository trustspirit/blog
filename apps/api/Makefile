.PHONY: help build run test fmt lint clean docker-build docker-run

# Variables
BINARY_NAME=api
MAIN_PATH=./cmd/api
DOCKER_IMAGE=blog-api

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the application
	@echo "Building..."
	go build -o $(BINARY_NAME) $(MAIN_PATH)
	@echo "Build complete: $(BINARY_NAME)"

run: ## Run the application
	@echo "Running..."
	go run $(MAIN_PATH)

test: ## Run tests
	@echo "Running tests..."
	go test -v ./...

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

fmt: ## Format code with gofmt and goimports
	@echo "Formatting code..."
	gofmt -s -w .
	goimports -w .
	@echo "Code formatted"

lint: ## Run golangci-lint
	@echo "Running linter..."
	golangci-lint run

lint-fix: ## Run golangci-lint with auto-fix
	@echo "Running linter with auto-fix..."
	golangci-lint run --fix

tidy: ## Tidy go modules
	@echo "Tidying go modules..."
	go mod tidy
	@echo "Modules tidied"

clean: ## Clean build artifacts
	@echo "Cleaning..."
	rm -f $(BINARY_NAME)
	rm -f coverage.out coverage.html
	go clean
	@echo "Clean complete"

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t $(DOCKER_IMAGE):latest .
	@echo "Docker image built: $(DOCKER_IMAGE):latest"

docker-run: ## Run Docker container
	@echo "Running Docker container..."
	docker run -p 3010:3010 --env-file .env $(DOCKER_IMAGE):latest

install-tools: ## Install development tools
	@echo "Installing tools..."
	go install golang.org/x/tools/cmd/goimports@latest
	@echo "goimports installed"
	@echo ""
	@echo "To install golangci-lint, run:"
	@echo "  brew install golangci-lint"
	@echo "  or"
	@echo "  go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"

dev: ## Run in development mode with hot reload (requires air)
	@echo "Starting development server..."
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "air is not installed. Install it with: go install github.com/cosmtrek/air@latest"; \
		echo "Running without hot reload..."; \
		go run $(MAIN_PATH); \
	fi

check: fmt lint test ## Run all checks (format, lint, test)
	@echo "All checks passed!"

.DEFAULT_GOAL := help
