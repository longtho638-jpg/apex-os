#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Apex Trading Engine...${NC}"

# Check for Redis
if ! command -v redis-cli &> /dev/null; then
    echo -e "${RED}⚠️  Redis is not installed or not in PATH.${NC}"
    echo "Please install Redis or ensure it is running."
    # We continue anyway as it might be a remote Redis
else
    # Try to ping Redis
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis is running${NC}"
    else
        echo -e "${RED}⚠️  Redis is not running locally.${NC}"
        echo "Attempting to start Redis..."
        # Try to start redis (brew services or direct)
        if command -v brew &> /dev/null; then
            brew services start redis
        else
            redis-server --daemonize yes
        fi
    fi
fi

# Kill existing processes if any (simple cleanup)
pkill -f "backend/websocket/server.ts"
pkill -f "backend/services/price-feed.ts"

# Start WebSocket Server
echo -e "${BLUE}🔌 Starting WebSocket Server...${NC}"
npx ts-node --project tsconfig.server.json backend/websocket/server.ts &
WS_PID=$!

# Wait a moment
sleep 2

# Start Price Feed Service
echo -e "${BLUE}📈 Starting Price Feed Service...${NC}"
npx ts-node --project tsconfig.server.json backend/services/price-feed.ts &
FEED_PID=$!

echo -e "${GREEN}✅ Trading Engine is running!${NC}"
echo "WebSocket Server PID: $WS_PID"
echo "Price Feed PID: $FEED_PID"
echo -e "${BLUE}Logs will appear below. Press Ctrl+C to stop.${NC}"

# Trap Ctrl+C to kill background processes
trap "kill $WS_PID $FEED_PID; exit" SIGINT SIGTERM

# Wait for processes
wait
