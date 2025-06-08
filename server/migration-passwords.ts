import { hashPassword } from './auth';
import { storage } from './storage';

// Migration script to update all users with hashed "pwd123" password
export async function migrateUserPasswords() {
  try {
    console.log('Starting password migration...');
    
    // Hash the default password "pwd123"
    const hashedPassword = await hashPassword('pwd123');
    console.log('Default password hashed successfully');
    
    // Get all users
    const users = await storage.getAllUsers();
    console.log(`Found ${users.length} users to update`);
    
    // Update each user with the hashed password
    for (const user of users) {
      await storage.updateUser(user.id, { password: hashedPassword });
      console.log(`Updated password for user: ${user.email}`);
    }
    
    console.log('Password migration completed successfully');
    return true;
  } catch (error) {
    console.error('Password migration failed:', error);
    return false;
  }
}