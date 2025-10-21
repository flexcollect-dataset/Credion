# 🚀 Bolt.new Deployment Guide for Credion Website

## **Prerequisites**
- GitHub repository: `https://github.com/flexcollect-dataset/Credion.git`
- Live PostgreSQL database (AWS RDS)
- Stripe test keys
- Bolt.new account

## **Step 1: Environment Variables for Bolt**

### **Backend Environment Variables:**
```bash
# Database Configuration (Live AWS RDS)
DB_HOST=flexdataset.cluster-cpoeqq6cwu00.ap-southeast-2.rds.amazonaws.com
DB_NAME=FlexDataseterMaster
DB_USER=rutvikkorat
DB_PASS=your_actual_password
DB_PORT=5432

# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Session & Security
SESSION_SECRET=your-super-secret-session-key-change-this
NODE_ENV=production

# CORS (Bolt will provide the URL)
CORS_ORIGIN=https://your-bolt-app-url.bolt.new

# Port
PORT=3000
```

### **Frontend Environment Variables:**
```bash
# API Base URL (Bolt will provide)
VITE_API_BASE_URL=https://your-bolt-backend-url.bolt.new

# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## **Step 2: Database Connection Setup**

### **Option A: Direct Connection (Recommended)**
- Use your live AWS RDS database directly
- No SSH tunnel needed in Bolt
- Configure SSL settings for production

### **Option B: Database URL Format**
```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

## **Step 3: Bolt Deployment Process**

### **1. Create New Bolt Project**
1. Go to [Bolt.new](https://bolt.new)
2. Click "New Project"
3. Connect your GitHub repository: `https://github.com/flexcollect-dataset/Credion.git`

### **2. Configure Backend Service**
1. **Service Type**: Node.js
2. **Build Command**: `cd backend && npm install`
3. **Start Command**: `cd backend && node app.js`
4. **Port**: 3000

### **3. Configure Frontend Service**
1. **Service Type**: Vite/React
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm run preview`
4. **Port**: 5173

### **4. Set Environment Variables**
Add all the environment variables listed above in Bolt's environment section.

## **Step 4: Database SSL Configuration**

Update your database config for production SSL:

```javascript
// backend/config/database.config.js
production: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
}
```

## **Step 5: Stripe Configuration**

### **Test Keys Setup:**
1. Get your Stripe test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Use test keys for non-production deployment
3. Configure webhook endpoints if needed

### **Frontend Stripe Integration:**
```typescript
// src/services/api.ts
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
```

## **Step 6: CORS Configuration**

Update CORS settings for Bolt deployment:

```javascript
// backend/app.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://your-frontend-url.bolt.new',
  credentials: true
}));
```

## **Step 7: Deployment Checklist**

### **Before Deployment:**
- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] Stripe test keys ready
- [ ] CORS origins updated
- [ ] SSL configuration for database
- [ ] Build commands verified

### **After Deployment:**
- [ ] Test database connection
- [ ] Test Stripe integration
- [ ] Test user authentication
- [ ] Test payment methods
- [ ] Test search functionality
- [ ] Verify all API endpoints

## **Step 8: Troubleshooting**

### **Common Issues:**

1. **Database Connection Failed:**
   - Check SSL configuration
   - Verify database credentials
   - Ensure database allows external connections

2. **CORS Errors:**
   - Update CORS_ORIGIN with correct Bolt URL
   - Check frontend API base URL

3. **Stripe Errors:**
   - Verify test keys are correct
   - Check webhook endpoints
   - Ensure HTTPS for production

4. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check build commands

## **Step 9: Monitoring**

### **Health Checks:**
- Database connection status
- API endpoint availability
- Stripe integration status
- User authentication flow

### **Logs:**
- Backend logs for database connections
- Frontend logs for API calls
- Error tracking and monitoring

## **Step 10: Security Considerations**

- Use environment variables for all secrets
- Enable SSL for database connections
- Configure proper CORS origins
- Use secure session secrets
- Implement rate limiting if needed

---

## **Quick Start Commands:**

```bash
# 1. Clone repository
git clone https://github.com/flexcollect-dataset/Credion.git

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Set environment variables (see above)
# 4. Deploy to Bolt.new
# 5. Configure services and environment
# 6. Test deployment
```

**Need Help?** Check the troubleshooting section or contact support.
