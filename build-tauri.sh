#!/bin/bash
# Build script for Tauri that handles API routes

# Temporarily move API routes out of the way for static export
mv app/api _api_backup 2>/dev/null || true

# Build the frontend
npm run build

# Restore API routes
mv _api_backup app/api 2>/dev/null || true

echo "Build complete. Static files are in ./dist"
