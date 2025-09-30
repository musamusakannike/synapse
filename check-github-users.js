// Script to check GitHub users in database
// Run this to verify GitHub authentication is creating/updating users correctly

const mongoose = require('mongoose');
require('dotenv').config();

// User model (copy from your models)
const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  profilePicture: { type: String, trim: true },
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function checkGitHubUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/synapse');
    
    console.log('🔍 Checking for GitHub users...\n');
    
    // Find users with GitHub ID
    const githubUsers = await User.find({ githubId: { $exists: true, $ne: null } });
    
    console.log(`Found ${githubUsers.length} GitHub users:`);
    githubUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. GitHub User:`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   GitHub ID: ${user.githubId}`);
      console.log(`   Profile Picture: ${user.profilePicture || 'N/A'}`);
      console.log(`   Last Login: ${user.lastLogin || 'Never'}`);
      console.log(`   Created: ${user.createdAt}`);
    });
    
    // Find users with both Google and GitHub
    const dualUsers = await User.find({ 
      googleId: { $exists: true, $ne: null },
      githubId: { $exists: true, $ne: null }
    });
    
    if (dualUsers.length > 0) {
      console.log(`\n🔗 Found ${dualUsers.length} users with both Google and GitHub:`);
      dualUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (Google: ${user.googleId}, GitHub: ${user.githubId})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkGitHubUsers();
