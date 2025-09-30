// Test script for GitHub authentication
// Run this after getting a Firebase ID token from the frontend

const axios = require('axios');

async function testGitHubAuth() {
  try {
    // You'll need to get this token from the frontend after GitHub login
    const idToken = 'YOUR_FIREBASE_ID_TOKEN_HERE';
    
    const response = await axios.post('http://localhost:5000/api/auth/github', {
      idToken: idToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ GitHub Auth Success:', response.data);
    console.log('Access Token:', response.data.accessToken);
  } catch (error) {
    console.error('❌ GitHub Auth Failed:', error.response?.data || error.message);
  }
}

// Uncomment and add real token to test
// testGitHubAuth();

console.log('GitHub Auth Test Script Ready');
console.log('1. Login with GitHub on frontend to get ID token');
console.log('2. Replace YOUR_FIREBASE_ID_TOKEN_HERE with actual token');
console.log('3. Uncomment testGitHubAuth() call and run: node test-github-auth.js');
