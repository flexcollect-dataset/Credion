#!/bin/bash

# 🚀 Bolt.new Deployment Script for Credion Website
# This script helps you deploy to Bolt.new with live database connection

echo "🚀 Starting Bolt.new Deployment Process..."

# Step 1: Verify Git Status
echo "📋 Step 1: Checking Git Status..."
git status
echo "✅ Git status checked"

# Step 2: Push Latest Changes
echo "📤 Step 2: Pushing latest changes to GitHub..."
git add .
git commit -m "feat: Prepare for Bolt.new deployment with live database"
git push origin main
echo "✅ Changes pushed to GitHub"

# Step 3: Display Environment Variables
echo "🔧 Step 3: Environment Variables for Bolt.new"
echo "=============================================="
echo ""
echo "Copy these environment variables to Bolt.new:"
echo ""
echo "Backend Environment Variables:"
echo "DB_HOST=flexdataset.cluster-cpoeqq6cwu00.ap-southeast-2.rds.amazonaws.com"
echo "DB_NAME=FlexDataseterMaster"
echo "DB_USER=rutvikkorat"
echo "DB_PASS=your_actual_database_password_here"
echo "DB_PORT=5432"
echo "STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here"
echo "STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here"
echo "SESSION_SECRET=your-super-secret-session-key-change-this"
echo "NODE_ENV=production"
echo "CORS_ORIGIN=https://your-bolt-frontend-url.bolt.new"
echo "PORT=3000"
echo ""
echo "Frontend Environment Variables:"
echo "VITE_API_BASE_URL=https://your-bolt-backend-url.bolt.new"
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here"
echo ""
echo "=============================================="

# Step 4: Deployment Instructions
echo "📝 Step 4: Deployment Instructions"
echo "=================================="
echo ""
echo "1. Go to https://bolt.new"
echo "2. Click 'New Project'"
echo "3. Connect GitHub repository: https://github.com/flexcollect-dataset/Credion.git"
echo "4. Configure Backend Service:"
echo "   - Type: Node.js"
echo "   - Build: cd backend && npm install"
echo "   - Start: cd backend && node app.js"
echo "   - Port: 3000"
echo "5. Configure Frontend Service:"
echo "   - Type: Vite/React"
echo "   - Build: npm install && npm run build"
echo "   - Start: npm run preview"
echo "   - Port: 5173"
echo "6. Add all environment variables listed above"
echo "7. Deploy and test!"
echo ""
echo "✅ Deployment script completed!"
echo "📖 See BOLT_DEPLOYMENT.md for detailed instructions"
