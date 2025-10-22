from minio import Minio
from minio.error import S3Error
import os

class MinioClient:
    def __init__(self):
        self.minio_client = Minio(
            os.getenv("MINIO_ENDPOINT"),
            access_key=os.getenv("MINIO_ACCESS_KEY"),
            secret_key=os.getenv("MINIO_SECRET_KEY"),
            secure=False
        )
        self.bucket_name = os.getenv("MINIO_BUCKET_NAME")

    def create_bucket(self):
        try:
            if not self.minio_client.bucket_exists(self.bucket_name):
                self.minio_client.make_bucket(self.bucket_name)
        except S3Error as e:
            print(f"Error creating bucket: {e}")

    def upload_file(self, file_path, object_name):
        try:
            self.minio_client.fput_object(self.bucket_name, object_name, file_path)
            print(f"File {file_path} uploaded to {object_name}.")
        except S3Error as e:
            print(f"Error uploading file: {e}")

    def download_file(self, object_name, file_path):
        try:
            self.minio_client.fget_object(self.bucket_name, object_name, file_path)
            print(f"File {object_name} downloaded to {file_path}.")
        except S3Error as e:
            print(f"Error downloading file: {e}")

    def list_files(self):
        try:
            objects = self.minio_client.list_objects(self.bucket_name)
            return [obj.object_name for obj in objects]
        except S3Error as e:
            print(f"Error listing files: {e}")
            return []