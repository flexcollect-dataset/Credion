# Bolt Deployment Guide for Credion Website

## 🚀 Quick Deployment Steps

### 1. Environment Variables Setup
Set these environment variables in your Bolt dashboard:

```bash
# Database Configuration (Test Database)
DB_HOST=localhost
DB_NAME=FlexDataseterMaster
DB_USER=FlexUser
DB_PASS=Luffy123&&Lucky
DB_PORT=15432

# Stripe Test Keys (Replace with your actual test keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# CORS Configuration (Update with your Bolt domain)
CORS_ORIGIN=https://your-bolt-domain.bolt.new

# Session Secret
SESSION_SECRET=your-production-session-secret-change-this

# ABN API Configuration
ABN_GUID=250e9f55-f46e-4104-b0df-774fa28cff97

# Node Environment
NODE_ENV=production
PORT=3000
```

### 2. Database Setup Options

#### Option A: Use Test Database (Recommended for Demo)
- The app will work without database connection
- Payment methods will be simulated
- User authentication will work with session storage

#### Option B: Connect to Live Database
- Set up PostgreSQL database on Bolt
- Update environment variables with your database credentials
- Ensure SSL is properly configured

### 3. Stripe Test Keys Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your test keys:
   - **Secret Key**: `sk_test_...`
   - **Publishable Key**: `pk_test_...`
3. Update the environment variables in Bolt

### 4. Frontend Configuration
The frontend will automatically build and serve from the `dist` folder.

### 5. CORS Configuration
Update the `CORS_ORIGIN` environment variable with your actual Bolt domain:
```
CORS_ORIGIN=https://your-app-name.bolt.new
```

## 🔧 Troubleshooting

### Database Connection Issues
- The app will continue to work without database connection
- Check environment variables are set correctly
- Ensure database credentials are valid

### CORS Issues
- Update `CORS_ORIGIN` with your actual Bolt domain
- Check that the frontend is being served from the correct origin

### Stripe Issues
- Ensure you're using test keys (not live keys)
- Check that Stripe keys are properly set in environment variables

## 📝 Notes
- This is configured for **test/development** use only
- Replace all test keys with production keys for live deployment
- Database connection is optional for basic functionality
- All payment processing uses Stripe test mode
