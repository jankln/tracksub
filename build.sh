#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

# Install backend dependencies
echo "Installing backend dependencies..."
npm install --prefix ./backend

# Build TypeScript
echo "Building backend..."
npm run build --prefix ./backend

# Install frontend dependencies and build
echo "Installing frontend dependencies..."
npm install --prefix ./frontend

echo "Building frontend..."
npm run build --prefix ./frontend

# Copy frontend build to backend public folder
echo "Copying frontend build..."
mkdir -p ./backend/dist/public
cp -r ./frontend/build/* ./backend/dist/public/

echo "Build completed successfully!"
