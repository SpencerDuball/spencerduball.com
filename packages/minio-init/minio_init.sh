#!/bin/bash

# Check required environment variables
required_env_vars=("MINIO_API_URL" "MINIO_ROOT_USER" "MINIO_ROOT_PASSWORD" "MINIO_ACCESS_KEY" "MINIO_SECRET_KEY")
missing_vars=()

for var in "${required_env_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "Error: The following required environment variables are not defined:"
  printf '%s\n' "${missing_vars[@]}"
  exit 1
fi

# Set the MinIO alias
mc alias set local "$MINIO_API_URL" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" || { echo "Failed to set MinIO alias"; exit 1; }

# Check if the user exists, and create if it doesn't
if ! mc admin user info local "$MINIO_ACCESS_KEY" >/dev/null 2>&1; then
  echo "User $MINIO_ACCESS_KEY does not exist. Creating..."
  mc admin user add local "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" || { echo "Failed to create user"; exit 1; }
else
  echo "User $MINIO_ACCESS_KEY already exists. Skipping creation."
fi

# Attach default policies to the user
mc admin policy attach local diagnostics --user "$MINIO_ACCESS_KEY"
mc admin policy attach local readwrite --user "$MINIO_ACCESS_KEY"

# Create buckets if they do not exist
buckets=("public" "private" "backup")

for bucket in "${buckets[@]}"; do
  if ! mc ls local/"$bucket" >/dev/null 2>&1; then
    echo "Bucket $bucket does not exist. Creating..."
    mc mb local/"$bucket" || { echo "Failed to create bucket $bucket"; exit 1; }
  else
    echo "Bucket $bucket already exists. Skipping creation."
  fi
done

# Create a public access policy for the "public" bucket
public_policy=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::public/*"]
    }
  ]
}
EOF
)

# Add the policy to MinIO if it doesn't exist
if ! mc admin policy info local publicaccess >/dev/null 2>&1; then
  echo "Adding publicaccess policy..."
  echo "$public_policy" | mc admin policy add local publicaccess - || { echo "Failed to add publicaccess policy"; exit 1; }
else
  echo "Policy publicaccess already exists. Skipping creation."
fi

# Attach the public access policy to the "public" bucket
mc anonymous set public local/public || { echo "Failed to set public access for bucket public"; exit 1; }

echo "Script execution completed successfully."