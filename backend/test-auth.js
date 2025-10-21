// Simple test script to verify auth endpoints work
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAuth() {
  try {
    console.log('Testing backend auth endpoints...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test signup endpoint
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      mobileNumber: '1234567890',
      currentPlan: 'monthly',
      agreeTerms: true
    };
    
    try {
      const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, signupData);
      console.log('✅ Signup test:', signupResponse.data);
    } catch (error) {
      console.log('⚠️ Signup test (expected to fail without DB):', error.response?.data || error.message);
    }
    
    // Test login endpoint
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
      console.log('✅ Login test:', loginResponse.data);
    } catch (error) {
      console.log('⚠️ Login test (expected to fail without DB):', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();
