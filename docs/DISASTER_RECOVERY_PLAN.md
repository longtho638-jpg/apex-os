# Disaster Recovery Plan (DRP) - ApexOS

## 1. Emergency Contacts
- **CTO:** [Phone Number]
- **DevOps Lead:** [Phone Number]
- **Supabase Support:** support@supabase.com (Enterprise Priority)

## 2. Recovery Objectives
- **RTO (Recovery Time Objective):** 4 Hours (Max downtime)
- **RPO (Recovery Point Objective):** 24 Hours (Max data loss)

## 3. Database Restoration Procedure
If the primary Supabase database is lost or corrupted:

### Step 1: Retrieve Backup
Download the latest backup from S3:
```bash
aws s3 cp s3://apex-backups/backup_LATEST.sql.gz ./
gunzip backup_LATEST.sql.gz
```

### Step 2: Restore to New Instance
```bash
# Get new connection string from Supabase Dashboard
export NEW_DB_URL="postgresql://postgres:..."

# Restore Schema and Data
psql "$NEW_DB_URL" < backup_LATEST.sql
```

### Step 3: Verify Integrity
- Check `users` count.
- Check latest `transactions`.
- Run `/api/health` check.

## 4. Application Recovery
If Vercel/Render is down:
1.  Switch DNS in Cloudflare to Backup Region (if configured).
2.  Or deploy Docker container to a new VPS (AWS EC2 / DigitalOcean) using `docker-compose.yml`.
