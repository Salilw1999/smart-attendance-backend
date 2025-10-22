#!/bin/bash

# Create a MinIO bucket for storing student photos
MINIO_BUCKET="student-photos"

# Check if the MinIO client (mc) is installed
if ! command -v mc &> /dev/null
then
    echo "MinIO client (mc) could not be found. Please install it first."
    exit 1
fi

# Configure MinIO client
mc alias set myminio http://minio:9000 minioadmin minioadmin

# Create the bucket if it doesn't exist
if ! mc ls myminio/$MINIO_BUCKET &> /dev/null
then
    mc mb myminio/$MINIO_BUCKET
    echo "Bucket '$MINIO_BUCKET' created."
else
    echo "Bucket '$MINIO_BUCKET' already exists."
fi

# Set bucket policy to allow public read access (optional)
mc policy set public myminio/$MINIO_BUCKET

echo "MinIO bucket initialization complete."