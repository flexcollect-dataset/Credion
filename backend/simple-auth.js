const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for testing
const users = new Map();
const JWT_SECRET = 'credion-test-secret';

// Helper functions
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Validation middleware
const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 }),
  body('mobileNumber').isLength({ min: 10, max: 15 }),
  body('currentPlan').isIn(['monthly', 'pay_as_you_go'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// POST /auth/signup
app.post('/auth/signup', signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: errors.array()[0].msg
      });
    }

    const { email, password, firstName, lastName, mobileNumber, currentPlan } = req.body;

    // Check if user exists
    if (users.has(email)) {
      return res.status(400).json({ 
        error: 'EMAIL_EXISTS',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = Date.now();
    const user = {
      userId,
      email,
      firstName,
      lastName,
      mobileNumber,
      currentPlan,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.set(email, user);

    // Generate token
    const accessToken = generateToken(userId, email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        currentPlan: user.currentPlan
      },
      accessToken,
      redirectUrl: '/dashboard'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'INTERNAL_ERROR',
      message: 'An error occurred during registration'
    });
  }
});

// POST /auth/login
app.post('/auth/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const accessToken = generateToken(user.userId, user.email);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        currentPlan: user.currentPlan
      },
      accessToken,
      redirectUrl: '/dashboard'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'INTERNAL_ERROR',
      message: 'An error occurred during login'
    });
  }
});

// POST /auth/logout
app.post('/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /auth/users (for testing)
app.get('/auth/users', (req, res) => {
  const userList = Array.from(users.values()).map(user => ({
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    currentPlan: user.currentPlan,
    createdAt: user.createdAt
  }));

  res.json({
    success: true,
    count: userList.length,
    users: userList
  });
});

// Payment Methods Routes
// In-memory storage for payment methods
const paymentMethods = new Map();

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

    // Create Stripe payment method
    const [month, year] = expiryDate.split('/');
    
    try {
      const stripePaymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: parseInt(month),
          exp_year: parseInt(`20${year}`),
          cvc: cvv,
        },
        billing_details: {
          name: cardholderName,
        },
      });

      const paymentMethod = {
        id: stripePaymentMethod.id,
        userId,
        last4: stripePaymentMethod.card.last4,
        brand: stripePaymentMethod.card.brand,
        expiryMonth: stripePaymentMethod.card.exp_month,
        expiryYear: stripePaymentMethod.card.exp_year,
        cardholderName,
        isDefault: isDefault || false,
        stripePaymentMethodId: stripePaymentMethod.id,
        createdAt: new Date().toISOString()
      };

      // If this is set as default, unset other defaults for this user
      if (isDefault) {
        for (let [id, pm] of paymentMethods) {
          if (pm.userId === userId) {
            pm.isDefault = false;
          }
        }
      }

      paymentMethods.set(stripePaymentMethod.id, paymentMethod);

      res.status(201).json({
        success: true,
        message: 'Payment method added successfully',
        paymentMethod: {
          id: paymentMethod.id,
          last4: paymentMethod.last4,
          brand: paymentMethod.brand,
          expiryMonth: paymentMethod.expiryMonth,
          expiryYear: paymentMethod.expiryYear,
          cardholderName: paymentMethod.cardholderName,
          isDefault: paymentMethod.isDefault
        }
      });

    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      res.status(400).json({
        error: 'PAYMENT_ERROR',
        message: stripeError.message || 'Invalid payment method details'
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
app.get('/payment-methods', (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'User ID is required'
      });
    }

    const userPaymentMethods = Array.from(paymentMethods.values())
      .filter(pm => pm.userId === userId)
      .map(pm => ({
        id: pm.id,
        last4: pm.last4,
        brand: pm.brand,
        expiryMonth: pm.expiryMonth,
        expiryYear: pm.expiryYear,
        cardholderName: pm.cardholderName,
        isDefault: pm.isDefault
      }));

    res.json({
      success: true,
      paymentMethods: userPaymentMethods
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
app.put('/payment-methods/:id/set-default', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const paymentMethod = paymentMethods.get(id);
    if (!paymentMethod || paymentMethod.userId !== userId) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Payment method not found'
      });
    }

    // Unset other defaults for this user
    for (let [pmId, pm] of paymentMethods) {
      if (pm.userId === userId && pmId !== id) {
        pm.isDefault = false;
      }
    }

    // Set this as default
    paymentMethod.isDefault = true;

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

    const paymentMethod = paymentMethods.get(id);
    if (!paymentMethod || paymentMethod.userId !== userId) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Payment method not found'
      });
    }

    // Detach from Stripe
    try {
      await stripe.paymentMethods.detach(id);
    } catch (stripeError) {
      console.error('Stripe detach error:', stripeError);
      // Continue with local deletion even if Stripe fails
    }

    paymentMethods.delete(id);

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Auth server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
