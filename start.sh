#!/bin/bash
# HYDRAGENT Production Starter Script

export DATABASE_URL="file:/home/c-jay69/Documents/GitHub/HYDRAGENT/db/custom.db"
export NODE_ENV=production

echo "🚀 Starting HYDRAGENT Revenue Engine..."
echo "🗄️  Database: $DATABASE_URL"

node .next/standalone/server.js
