#!/bin/bash

# Update Tracksub with PostgreSQL support

echo "🚀 Preparing to update Tracksub with PostgreSQL support..."
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Show what will be committed
echo "📋 Files to be committed:"
git status --short

echo ""
read -p "Continue with commit? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add PostgreSQL support with Sequelize ORM

- Migrate from raw SQLite queries to Sequelize ORM
- Add automatic PostgreSQL support for production
- Keep SQLite for local development
- Add User and Subscription models with TypeScript
- Convert all routes to async/await
- Add automatic table creation on startup
- Include step-by-step PostgreSQL setup guide for Render
- Improve type safety across backend

Benefits:
- No data loss on redeploys
- Better performance and scalability
- Type-safe database operations
- Easy local development workflow"

echo ""
echo "✅ Changes committed!"
echo ""
echo "📤 To push to GitHub and trigger Render deployment:"
echo "   git push origin main"
echo ""
echo "📖 After pushing, follow RENDER_POSTGRES_SETUP.md to set up PostgreSQL"
