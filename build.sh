#!/usr/bin/env bash
# exit on error
set -o errexit

# Install backend dependencies
cd backend
npm install

# Build TypeScript
npm run build

# Install frontend dependencies and build
cd ../frontend
npm install
npm run build

# Copy frontend build to backend public folder
mkdir -p ../backend/dist/public
cp -r build/* ../backend/dist/public/
