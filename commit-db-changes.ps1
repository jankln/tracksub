# Update Tracksub with PostgreSQL support

Write-Host "🚀 Preparing to update Tracksub with PostgreSQL support..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Error: Not in a git repository" -ForegroundColor Red
    exit 1
}

# Show what will be committed
Write-Host "📋 Files to be committed:" -ForegroundColor Yellow
git status --short

Write-Host ""
$response = Read-Host "Continue with commit? (y/n)"

if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host "❌ Aborted" -ForegroundColor Red
    exit 1
}

# Stage all changes
git add .

# Commit with descriptive message
git commit -m @"
feat: Add PostgreSQL support with Sequelize ORM

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
- Easy local development workflow
"@

Write-Host ""
Write-Host "✅ Changes committed!" -ForegroundColor Green
Write-Host ""
Write-Host "📤 To push to GitHub and trigger Render deployment:" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "📖 After pushing, follow RENDER_POSTGRES_SETUP.md to set up PostgreSQL" -ForegroundColor Cyan
