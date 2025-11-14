# Docker Setup for MongoDB

This project includes a Docker Compose configuration for running MongoDB locally.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. Start MongoDB:
```bash
docker-compose up -d
```

2. Verify MongoDB is running:
```bash
docker-compose ps
```

3. Stop MongoDB:
```bash
docker-compose down
```

4. Stop and remove volumes (deletes all data):
```bash
docker-compose down -v
```

## Services

### MongoDB
- **Port**: `27017`
- **Database**: `blog`
- **Username**: `admin`
- **Password**: `password`
- **Connection String**: `mongodb://admin:password@localhost:27017/blog?authSource=admin`

### MongoDB Express (Web UI)
- **URL**: http://localhost:8081
- **Username**: `admin`
- **Password**: `admin`

MongoDB Express provides a web-based interface to view and manage your MongoDB database.

## Configuration

### Environment Variables

Set the `MONGODB_URI` in your `.env` file:

```env
MONGODB_URI=mongodb://admin:password@localhost:27017/blog?authSource=admin
```

### Without Authentication

If you prefer to run MongoDB without authentication, you can modify `docker-compose.yml`:

1. Remove the `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` environment variables
2. Update the connection string to: `mongodb://localhost:27017/blog`

## Data Persistence

MongoDB data is stored in Docker volumes:
- `mongodb_data`: Database files
- `mongodb_config`: Configuration files

Data persists even after stopping the containers. To completely remove all data, use:
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If port 27017 is already in use, you can change it in `docker-compose.yml`:
```yaml
ports:
  - '27018:27017'  # Use 27018 on host instead
```

Then update your connection string accordingly.

### Connection Issues

1. Make sure Docker is running
2. Check container status: `docker-compose ps`
3. View logs: `docker-compose logs mongodb`
4. Ensure the connection string in your `.env` matches the Docker configuration

