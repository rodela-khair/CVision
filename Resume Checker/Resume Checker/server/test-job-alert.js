const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('./models/Job');
const JobAlert = require('./models/JobAlert');
const Notification = require('./models/Notification');
const { alertChecker } = require('./services/alertChecker');

async function testJobAlert() {
  try {
    console.log('🔍 Testing Job Alert System...');
    
    // Create a test job
    const testJob = new Job({
      title: 'React Developer',
      company: 'Tech Corp',
      location: 'New York',
      requiredSkills: ['React', 'JavaScript', 'Node.js'],
      description: 'Looking for an experienced React developer to join our team.',
      createdAt: new Date() // This should trigger alerts
    });
    
    await testJob.save();
    console.log('✅ Test job created:', testJob.title);
    
    // Check existing alerts
    const alerts = await JobAlert.find({ isActive: true });
    console.log(`📋 Found ${alerts.length} active alerts`);
    
    for (const alert of alerts) {
      console.log(`   - ${alert.name} (Skills: ${alert.skills.join(', ')})`);
      
      // Check if this job matches the alert
      const matchesSkills = alert.skills.some(skill => 
        testJob.requiredSkills.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const matchesLocation = alert.locations.length === 0 || alert.locations.some(loc =>
        testJob.location.toLowerCase().includes(loc.toLowerCase())
      );
      
      const matchesCompany = alert.companies.length === 0 || alert.companies.some(comp =>
        testJob.company.toLowerCase().includes(comp.toLowerCase())
      );
      
      if (matchesSkills || matchesLocation || matchesCompany) {
        console.log(`     ✅ Job matches this alert!`);
        
        // Create notification manually (since the alert checker runs every 5 minutes)
        const notification = new Notification({
          userId: alert.userId,
          alertId: alert._id,
          jobId: testJob._id,
          title: `New Job Match: ${testJob.title}`,
          message: `A new job "${testJob.title}" at ${testJob.company} matches your alert "${alert.name}"`,
          type: 'job_match'
        });
        
        await notification.save();
        console.log('     📢 Notification created!');
      }
    }
    
    console.log('\n🎉 Test completed! Check your notifications page.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testJobAlert();
