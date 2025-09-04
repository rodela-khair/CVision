// Test instant notifications by creating a job via API
const axios = require('axios');

async function testInstantNotifications() {
  try {
    console.log('🧪 Testing Instant Notifications via API...');
    
    // You'll need to replace this token with a valid admin token
    // To get a token: 1) Sign up/login as admin, 2) Copy token from localStorage
    const adminToken = 'YOUR_ADMIN_TOKEN_HERE';
    
    const newJob = {
      title: 'Full Stack Developer',
      company: 'Startup Inc',
      location: 'Remote',
      requiredSkills: ['React', 'Node.js', 'MongoDB'],
      description: 'Join our fast-growing startup as a full stack developer!'
    };
    
    console.log('📡 Sending POST request to create job...');
    
    const response = await axios.post('http://localhost:5000/api/jobs', newJob, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Job created successfully!');
    console.log('📋 Job details:', response.data.job);
    console.log('\n🚀 Instant notifications should have been triggered!');
    console.log('💡 Check the server console for instant notification logs');
    console.log('💡 Check the notifications page in the app to see new notifications');
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Authentication error - you need a valid admin token');
      console.log('💡 To get a token:');
      console.log('   1. Sign up/login as an admin in the app');
      console.log('   2. Open browser dev tools > Application > Local Storage');
      console.log('   3. Copy the "token" value');
      console.log('   4. Replace "YOUR_ADMIN_TOKEN_HERE" in this script');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

testInstantNotifications();
