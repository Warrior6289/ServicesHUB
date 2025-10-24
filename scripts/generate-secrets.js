import crypto from 'crypto';

console.log('Generated Secrets for Production:');
console.log('================================');
console.log(`JWT_SECRET=${crypto.randomBytes(32).toString('hex')}`);
console.log(`JWT_REFRESH_SECRET=${crypto.randomBytes(32).toString('hex')}`);
console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}`);
console.log(`ADMIN_API_KEY=${crypto.randomBytes(16).toString('hex')}`);
console.log('');
console.log('Copy these values to your .env file or Vercel environment variables.');
console.log('Make sure to keep these secrets secure and never commit them to version control.');
