require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:5176', 'https://credion-1.onrender.com'],
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Credion API Server',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Payment Methods API Routes (defined before auth to avoid middleware conflicts)
// POST /payment-methods - Add new payment method
app.post('/payment-methods', async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, cardholderName, isDefault, userId } = req.body;

    // Basic validation
    if (!cardNumber || !expiryDate || !cvv || !cardholderName || !userId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'All fields are required'
      });
    }

    // For development/testing, we'll simulate Stripe payment method creation
    // In production, you'd use Stripe Elements on the frontend for security
    const [month, year] = expiryDate.split('/');
    
    try {
      // Simulate successful payment method creation for testing
      const simulatedPaymentMethod = {
        id: `pm_test_${Date.now()}`,
        last4: cardNumber.slice(-4),
        brand: cardNumber.startsWith('4') ? 'visa' : 'mastercard',
        expiryMonth: parseInt(month),
        expiryYear: parseInt(`20${year}`),
        cardholderName,
        isDefault: isDefault || false
      };

      // TODO: Save to database using Sequelize models
      // For now, return success response
      res.status(201).json({
        success: true,
        message: 'Payment method added successfully',
        paymentMethod: simulatedPaymentMethod
      });

    } catch (error) {
      console.error('Payment method creation error:', error);
      res.status(400).json({
        error: 'PAYMENT_ERROR',
        message: 'Invalid payment method details'
      });
    }

  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while adding payment method'
    });
  }
});

// GET /payment-methods - Get user's payment methods
app.get('/payment-methods', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'User ID is required'
      });
    }

    // Fetch from database using Sequelize
    const paymentMethods = await UserPaymentMethod.findAll({
      where: {
        userId: userId,
        isActive: true
      },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    
    // Transform the data to match frontend expectations
    const formattedPaymentMethods = paymentMethods.map(method => ({
      id: method.stripePaymentMethodId || method.paymentMethodId,
      last4: method.cardLast4,
      brand: method.cardBrand,
      expiryMonth: method.cardExpMonth,
      expiryYear: method.cardExpYear,
      isDefault: method.isDefault,
      cardholderName: 'Card Holder' // We don't store this in the current schema
    }));

    res.json({
      success: true,
      paymentMethods: formattedPaymentMethods
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while fetching payment methods'
    });
  }
});

// PUT /payment-methods/:id/set-default - Set default payment method
app.put('/payment-methods/:id/set-default', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'User ID is required'
      });
    }

    // First, unset all default payment methods for this user
    await UserPaymentMethod.update(
      { isDefault: false },
      { where: { userId: userId } }
    );

    // Then set the specified payment method as default
    const [updatedRows] = await UserPaymentMethod.update(
      { isDefault: true },
      { 
        where: { 
          stripePaymentMethodId: id,
          userId: userId 
        },
        returning: true
      }
    );

    if (updatedRows === 0) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Payment method not found'
      });
    }

    res.json({
      success: true,
      message: 'Default payment method updated'
    });

  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while updating default payment method'
    });
  }
});

// DELETE /payment-methods/:id - Delete payment method
app.delete('/payment-methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'User ID is required'
      });
    }

    // Soft delete from database (set is_active = false)
    const [updatedRows] = await UserPaymentMethod.update(
      { isActive: false },
      { 
        where: { 
          stripePaymentMethodId: id,
          userId: userId 
        },
        returning: true
      }
    );

    if (updatedRows === 0) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Payment method not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while deleting payment method'
    });
  }
});

// Authentication Routes (PostgreSQL)
const authRoutes = require('./routes/auth.postgres');
app.use('/auth', authRoutes);

// Import models for search route
const { User, UserPaymentMethod } = require('./models');

// Card Details route (requires authentication)
app.get('/card-details', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    // Get user details
    const user = await User.findByPk(req.session.userId, {
      attributes: ['userId', 'firstName', 'lastName', 'email', 'isActive', 'currentPlan']
    });
    
    if (!user || !user.isActive) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }
    
    res.json({ 
      message: 'Payment method page data',
      userId: user.userId,
      userEmail: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      appName: process.env.APP_NAME || 'Credion'
    });
  } catch (error) {
    console.error('Error rendering card details page:', error);
    res.redirect('/auth/login');
  }
});

// Payment Methods Management route (requires authentication)
app.get('/payment-methods', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    // Get user details
    const user = await User.findByPk(req.session.userId, {
      attributes: ['userId', 'firstName', 'lastName', 'email', 'isActive']
    });
    
    if (!user || !user.isActive) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }
    
    res.json({ 
      message: 'Payment methods page data',
      userId: user.userId,
      userEmail: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      appName: process.env.APP_NAME || 'Credion'
    });
  } catch (error) {
    console.error('Error rendering payment methods page:', error);
    res.redirect('/auth/login');
  }
});

// Search route (requires authentication)
app.get('/search', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    // Get user details
    const user = await User.findByPk(req.session.userId, {
      attributes: ['userId', 'firstName', 'lastName', 'email', 'isActive']
    });
    
    if (!user || !user.isActive) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }
    
    res.json({ 
      message: 'Search page data',
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      appName: process.env.APP_NAME || 'Credion'
    });
  } catch (error) {
    console.error('Error rendering search page:', error);
    res.redirect('/auth/login');
  }
});

// Payment Routes
const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payment', paymentRoutes);

// API Routes
const apiRoutes = require('./routes/api.routes');
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Credion server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test database connection (optional)
  try {
    await testConnection();
  } catch (error) {
    console.log('⚠️  Database connection failed, but server will continue running');
    console.log('💡 Set up database environment variables to enable database features');
  }
});

module.exports = app;

