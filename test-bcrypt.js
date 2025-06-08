import bcrypt from 'bcrypt';

(async () => {
  try {
    const password = 'pwd123';
    console.log('Testing bcrypt with password:', password);
    
    // Generate hash
    const hash = await bcrypt.hash(password, 10);
    console.log('Generated hash:', hash);
    console.log('Hash length:', hash.length);
    
    // Test validation
    const isValid = await bcrypt.compare(password, hash);
    console.log('Validation result:', isValid);
    
    // Test with wrong password
    const isInvalid = await bcrypt.compare('wrongpassword', hash);
    console.log('Wrong password validation:', isInvalid);
    
  } catch (error) {
    console.error('Bcrypt test failed:', error);
  }
})();