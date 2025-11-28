#!/bin/bash

# Cleanup old audit logs (retention policy)
# Run this script weekly via cron

echo "🧹 Cleaning up old audit logs..."

npx ts-node --project tsconfig.server.json << 'EOF'
import { auditService } from '../src/lib/audit';

async function cleanup() {
  const deletedCount = await auditService.deleteOldLogs(90); // 90 days retention
  console.log(`✅ Deleted ${deletedCount} old audit log(s)`);
}

cleanup().catch(console.error);
EOF

echo "✅ Cleanup complete"
