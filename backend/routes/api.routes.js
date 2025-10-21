const express = require('express');
const router = express.Router();

// Example API endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Credion API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/auth'
    }
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication routes are now in app.js directly
// Removed to prevent duplicate routes

// Helper function to search ABN by name using Australian Business Register API
async function searchABNByName(companyName) {
  const ABN_GUID = process.env.ABN_GUID || '1'; // You'll need to add this to your .env
  const url = `https://abr.business.gov.au/json/MatchingNames.aspx?name=${encodeURIComponent(companyName)}&maxResults=10&guid=${ABN_GUID}`;
  
  console.log(`Searching ABN for: ${companyName}`);
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    // Extract JSON from JSONP response
    const match = text.match(/callback\((.*)\)/);
    if (!match) {
      throw new Error('Invalid ABN lookup response format');
    }
    
    const data = JSON.parse(match[1]);
    return data.Names || [];
  } catch (error) {
    console.error('Error searching ABN by name:', error);
    throw error;
  }
}

// Helper function to get ABN details
async function getABNInfo(abn) {
  const ABN_GUID = process.env.ABN_GUID || '1'; // You'll need to add this to your .env
  const url = `https://abr.business.gov.au/json/AbnDetails.aspx?abn=${abn}&callback=callback&guid=${ABN_GUID}`;
  
  console.log(`Getting ABN info for: ${abn}`);
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    // Extract JSON from JSONP response
    const match = text.match(/callback\((.*)\)/);
    if (!match) {
      throw new Error('Invalid ABN lookup response format');
    }
    
    const data = JSON.parse(match[1]);
    return data;
  } catch (error) {
    console.error('Error fetching ABN info:', error);
    throw error;
  }
}

// Helper function to sanitize business number
function sanitizeBusinessNumber(input) {
  return input.replace(/\D/g, '');
}

// Search API endpoint
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Search query is required'
      });
    }
    
    const searchTerm = query.trim();
    
    // Check if the query looks like an ABN (digits only)
    const sanitizedQuery = sanitizeBusinessNumber(searchTerm);
    const isABNSearch = sanitizedQuery.length >= 10 && /^\d+$/.test(sanitizedQuery);
    
    let results = [];
    
    if (isABNSearch) {
      // If it looks like an ABN, get company info directly
      try {
        const abnInfo = await getABNInfo(sanitizedQuery);
        if (abnInfo && abnInfo.Abn) {
          results = [{
            Abn: abnInfo.Abn,
            Name: abnInfo.EntityName || abnInfo.EntityName || 'Unknown',
            entityStatus: abnInfo.EntityStatus || 'Unknown',
            entityType: abnInfo.EntityType || 'Unknown',
            address: abnInfo.Address ? 
              `${abnInfo.Address.AddressLine}, ${abnInfo.Address.Suburb} ${abnInfo.Address.State} ${abnInfo.Address.Postcode}` : 
              'Address not available'
          }];
        }
      } catch (error) {
        console.error('Error fetching ABN info:', error);
        // Fallback to empty results if ABN lookup fails
      }
    } else {
      // Otherwise search by company name
      try {
        const abnResults = await searchABNByName(searchTerm);
        results = abnResults.map(result => ({
          Abn: result.Abn,
          Name: result.Name || 'Unknown',
          entityStatus: 'Available via ABN lookup',
          entityType: 'Available via ABN lookup',
          address: 'Available via ABN lookup'
        }));
      } catch (error) {
        console.error('Error searching ABN by name:', error);
        // Fallback to empty results if name search fails
      }
    }
    
    res.json({
      success: true,
      query: query,
      results: results,
      total: results.length,
      message: `Found ${results.length} result${results.length !== 1 ? 's' : ''}`
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An error occurred during search'
    });
  }
});

// Add more routes here as needed
// router.use('/users', require('./users.routes'));

module.exports = router;

