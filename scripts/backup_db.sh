#!/bin/bash
# Backup Database to S3
# Usage: ./scripts/backup_db.sh

# Ensure DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$TIMESTAMP.sql.gz"

echo "Starting backup for $TIMESTAMP..."

# Dump and Compress
# Note: Requires pg_dump to be installed
if ! command -v pg_dump &> /dev/null; then
    echo "Error: pg_dump could not be found."
    exit 1
fi

pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup created: $BACKUP_FILE"
  
  # Upload to S3 (Mock or Real if AWS CLI exists)
  if command -v aws &> /dev/null; then
    aws s3 cp "$BACKUP_FILE" "s3://apex-backups/$BACKUP_FILE"
    echo "Uploaded to S3."
  else
    echo "AWS CLI not found. Skipping upload."
    echo "Please install aws-cli and configure credentials."
    echo "Or use another storage provider (Google Drive, R2, etc)."
  fi
  
  # Cleanup local file (Optional: Keep last N backups locally?)
  # rm "$BACKUP_FILE"
  echo "Local backup kept at: $BACKUP_FILE"
else
  echo "Backup failed!"
  exit 1
fi
