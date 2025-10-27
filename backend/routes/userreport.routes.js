const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { UserReport } = require('../models');

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

// Get all user reports (public - no authentication required)
router.get('/', async (req, res) => {
  try {
    const reports = await UserReport.findAll({
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      reports: reports.map(report => ({
        reportId: report.reportId,
        userId: report.userId,
        matterId: report.matterId,
        reportName: report.reportName,
        isPaid: report.isPaid,
        type: report.type,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      }))
    });

  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      error: 'REPORTS_RETRIEVAL_FAILED',
      message: error.message || 'Failed to get reports'
    });
  }
});

// Get user reports by matter ID
router.get('/matter/:matterId', authenticateToken, async (req, res) => {
  try {
    const { matterId } = req.params;
    const userId = req.userId;

    const reports = await UserReport.findAll({
      where: { 
        matterId: matterId,
        userId: userId 
      },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      reports: reports.map(report => ({
        reportId: report.reportId,
        userId: report.userId,
        matterId: report.matterId,
        reportName: report.reportName,
        isPaid: report.isPaid,
        type: report.type,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      }))
    });

  } catch (error) {
    console.error('Error getting user reports:', error);
    res.status(500).json({
      error: 'REPORTS_RETRIEVAL_FAILED',
      message: error.message || 'Failed to get user reports'
    });
  }
});

module.exports = router;
