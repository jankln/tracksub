#!/usr/bin/env bash
# exit on error
set -o errexit

# Install backend dependencies
npm install --prefix backend

# Build TypeScript
npm run build --prefix backend

# Install frontend dependencies and build
npm install --prefix frontend
npm run build --prefix frontend

# Copy frontend build to backend public folder
mkdir -p backend/dist/public
cp -r frontend/build/* backend/dist/public/
