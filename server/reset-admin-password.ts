import { hashPassword } from './auth';
import { storage } from './storage';

// Direct password reset for admin user
export async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    // Hash the password "pwd123" fresh
    const hashedPassword = await hashPassword('pwd123');
    console.log('New hash generated:', hashedPassword.substring(0, 20) + '...');
    
    // Update admin user specifically
    const result = await storage.updateUser(10, { password: hashedPassword });
    
    if (result) {
      console.log('Admin password reset successfully for user:', result.email);
      return true;
    } else {
      console.log('Failed to find admin user with ID 10');
      return false;
    }
  } catch (error) {
    console.error('Password reset failed:', error);
    return false;
  }
}