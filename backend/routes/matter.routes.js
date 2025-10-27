const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Matter } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to check if user is authenticated (JWT)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'UNAUTHORIZED',
            message: 'Please log in to continue' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                error: 'INVALID_TOKEN',
                message: 'Invalid or expired token' 
            });
        }
        req.user = decoded;
        req.userId = decoded.userId;
        next();
    });
};

// Create new matter
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { matterName, description } = req.body;
    const userId = req.userId;

    console.log('Creating matter with data:', { matterName, description, userId });

    if (!matterName || !matterName.trim()) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: 'Matter name is required'
      });
    }

    const matter = await Matter.create({
      userId: userId,
      matterName: matterName.trim(),
      description: description || null,
      status: 'active'
    });

    console.log('Matter created successfully:', matter.toJSON());

    res.json({
      success: true,
      message: 'Matter created successfully',
      matter: {
        matterId: matter.matterId,
        matterName: matter.matterName,
        description: matter.description,
        status: matter.status,
        createdAt: matter.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating matter:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      parent: error.parent
    });
    res.status(500).json({
      error: 'MATTER_CREATION_FAILED',
      message: error.message || 'Failed to create matter'
    });
  }
});

// Search matters for user
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.userId;

    let whereClause = { userId: userId };
    
    if (query && query.trim()) {
      whereClause.matterName = {
        [require('sequelize').Op.iLike]: `%${query.trim()}%`
      };
    }

    const matters = await Matter.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 20,
      attributes: ['matterId', 'matterName', 'description', 'status', 'createdAt', 'updatedAt']
    });

    console.log('Matters found:', matters.length);
    if (matters.length > 0) {
      console.log('First matter:', {
        matterId: matters[0].matterId,
        matterName: matters[0].matterName,
        createdAt: matters[0].createdAt,
        updatedAt: matters[0].updatedAt
      });
    }

    // Add cache-busting headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      matters: matters.map(matter => ({
        matterId: matter.matterId,
        matterName: matter.matterName,
        description: matter.description,
        status: matter.status,
        createdAt: matter.createdAt,
        updatedAt: matter.updatedAt
      }))
    });

  } catch (error) {
    console.error('Error searching matters:', error);
    res.status(500).json({
      error: 'MATTER_SEARCH_FAILED',
      message: error.message || 'Failed to search matters'
    });
  }
});

// Get all matters for user
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const matters = await Matter.findAll({
      where: { userId: userId },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      matters: matters.map(matter => ({
        matterId: matter.matterId,
        matterName: matter.matterName,
        description: matter.description,
        status: matter.status,
        createdAt: matter.createdAt,
        updatedAt: matter.updatedAt
      }))
    });

  } catch (error) {
    console.error('Error getting matters:', error);
    res.status(500).json({
      error: 'MATTER_LIST_FAILED',
      message: error.message || 'Failed to get matters'
    });
  }
});

// Get specific matter with reports
router.get('/:matterId', authenticateToken, async (req, res) => {
  try {
    const { matterId } = req.params;
    const userId = req.userId;

    const matter = await Matter.findOne({
      where: { 
        matterId: matterId,
        userId: userId 
      }
    });

    if (!matter) {
      return res.status(404).json({
        error: 'MATTER_NOT_FOUND',
        message: 'Matter not found'
      });
    }

    res.json({
      success: true,
      matter: {
        matterId: matter.matterId,
        matterName: matter.matterName,
        description: matter.description,
        status: matter.status,
        createdAt: matter.createdAt,
        updatedAt: matter.updatedAt
      }
    });

  } catch (error) {
    console.error('Error getting matter:', error);
    res.status(500).json({
      error: 'MATTER_GET_FAILED',
      message: error.message || 'Failed to get matter'
    });
  }
});

// Update matter
router.put('/:matterId', authenticateToken, async (req, res) => {
  try {
    const { matterId } = req.params;
    const { matterName, description, status } = req.body;
    const userId = req.userId;

    const matter = await Matter.findOne({
      where: { 
        matterId: matterId,
        userId: userId 
      }
    });

    if (!matter) {
      return res.status(404).json({
        error: 'MATTER_NOT_FOUND',
        message: 'Matter not found'
      });
    }

    if (matterName) matter.matterName = matterName.trim();
    if (description !== undefined) matter.description = description;
    if (status) matter.status = status;

    await matter.save();

    res.json({
      success: true,
      message: 'Matter updated successfully',
      matter: {
        matterId: matter.matterId,
        matterName: matter.matterName,
        description: matter.description,
        status: matter.status,
        updatedAt: matter.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating matter:', error);
    res.status(500).json({
      error: 'MATTER_UPDATE_FAILED',
      message: error.message || 'Failed to update matter'
    });
  }
});

// Delete matter
router.delete('/:matterId', authenticateToken, async (req, res) => {
  try {
    const { matterId } = req.params;
    const userId = req.userId;

    const matter = await Matter.findOne({
      where: { 
        matterId: matterId,
        userId: userId 
      }
    });

    if (!matter) {
      return res.status(404).json({
        error: 'MATTER_NOT_FOUND',
        message: 'Matter not found'
      });
    }

    await matter.destroy();

    res.json({
      success: true,
      message: 'Matter deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting matter:', error);
    res.status(500).json({
      error: 'MATTER_DELETE_FAILED',
      message: error.message || 'Failed to delete matter'
    });
  }
});

module.exports = router;
