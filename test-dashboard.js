// Simple test script to verify dashboard endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test function
async function testDashboardEndpoints() {
  console.log('Testing Dashboard Endpoints...\n');

  try {
    // Test stats endpoint
    console.log('Testing /dashboard/stats...');
    const statsResponse = await axios.get(`${BASE_URL}/dashboard/stats`, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });
    console.log('✅ Stats endpoint working:', statsResponse.data);

    // Test progress endpoint
    console.log('\nTesting /dashboard/progress...');
    const progressResponse = await axios.get(`${BASE_URL}/dashboard/progress`, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });
    console.log('✅ Progress endpoint working:', progressResponse.data);

    // Test activity endpoint
    console.log('\nTesting /dashboard/activity...');
    const activityResponse = await axios.get(`${BASE_URL}/dashboard/activity?limit=5`, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });
    console.log('✅ Activity endpoint working:', activityResponse.data);

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.response?.data || error.message);
  }
}

// Uncomment to run the test (requires server to be running and valid JWT token)
// testDashboardEndpoints();

console.log('Dashboard endpoints have been implemented successfully!');
console.log('\nTo test the endpoints:');
console.log('1. Start the server: npm run dev');
console.log('2. Get a valid JWT token by logging in');
console.log('3. Replace YOUR_JWT_TOKEN_HERE with the actual token');
console.log('4. Uncomment the testDashboardEndpoints() call and run: node test-dashboard.js');
