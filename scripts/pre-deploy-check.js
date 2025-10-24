import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍 Pre-deployment verification starting...\n');

let hasErrors = false;

// Helper function to run commands and check results
function runCheck(name, command, cwd = process.cwd()) {
  console.log(`⏳ ${name}...`);
  try {
    execSync(command, { 
      cwd, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    console.log(`✅ ${name} passed\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} failed:`);
    console.log(error.stdout || error.message);
    console.log('');
    return false;
  }
}

// Check if required files exist
function checkRequiredFiles() {
  console.log('📁 Checking required files...');
  
  const requiredFiles = [
    'package.json',
    'backend/package.json',
    'vercel.json',
    'api/health.ts',
    'backend/src/config/env.ts',
    'backend/src/scripts/deploy-seed.ts'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.log('❌ Missing required files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');
    return false;
  }
  
  console.log('✅ All required files present\n');
  return true;
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('🔧 Checking environment variables...');
  
  const requiredEnvVars = [
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(envVar => console.log(`   - ${envVar}`));
    console.log('');
    console.log('💡 Set these variables in your .env file or Vercel dashboard');
    console.log('');
    return false;
  }
  
  console.log('✅ All required environment variables present\n');
  return true;
}

// Check package.json scripts
function checkPackageScripts() {
  console.log('📦 Checking package.json scripts...');
  
  const frontendPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  
  const requiredFrontendScripts = [
    'build',
    'type-check',
    'lint',
    'test',
    'vercel-build'
  ];
  
  const requiredBackendScripts = [
    'build',
    'type-check',
    'test',
    'deploy:seed'
  ];
  
  const missingFrontendScripts = requiredFrontendScripts.filter(script => !frontendPackage.scripts[script]);
  const missingBackendScripts = requiredBackendScripts.filter(script => !backendPackage.scripts[script]);
  
  if (missingFrontendScripts.length > 0) {
    console.log('❌ Missing frontend scripts:');
    missingFrontendScripts.forEach(script => console.log(`   - ${script}`));
    console.log('');
  }
  
  if (missingBackendScripts.length > 0) {
    console.log('❌ Missing backend scripts:');
    missingBackendScripts.forEach(script => console.log(`   - ${script}`));
    console.log('');
  }
  
  if (missingFrontendScripts.length > 0 || missingBackendScripts.length > 0) {
    return false;
  }
  
  console.log('✅ All required scripts present\n');
  return true;
}

// Main verification function
async function runPreDeploymentCheck() {
  console.log('🚀 Services Hub Pre-Deployment Verification\n');
  console.log('==========================================\n');
  
  // Check required files
  if (!checkRequiredFiles()) {
    hasErrors = true;
  }
  
  // Check package.json scripts
  if (!checkPackageScripts()) {
    hasErrors = true;
  }
  
  // Check environment variables (only if .env exists)
  if (fs.existsSync('.env') || fs.existsSync('backend/.env')) {
    if (!checkEnvironmentVariables()) {
      hasErrors = true;
    }
  } else {
    console.log('⚠️  No .env file found - make sure to set environment variables in Vercel dashboard\n');
  }
  
  // Run TypeScript compilation check
  if (!runCheck('TypeScript compilation (frontend)', 'npm run type-check')) {
    hasErrors = true;
  }
  
  // Run TypeScript compilation check for backend
  if (!runCheck('TypeScript compilation (backend)', 'npm run type-check', 'backend')) {
    hasErrors = true;
  }
  
  // Run linting check
  if (!runCheck('ESLint check (frontend)', 'npm run lint')) {
    hasErrors = true;
  }
  
  // Run linting check for backend
  if (!runCheck('ESLint check (backend)', 'npm run lint', 'backend')) {
    hasErrors = true;
  }
  
  // Run tests
  if (!runCheck('Frontend tests', 'npm test')) {
    hasErrors = true;
  }
  
  // Run backend tests
  if (!runCheck('Backend tests', 'npm test', 'backend')) {
    hasErrors = true;
  }
  
  // Run build check
  if (!runCheck('Frontend build', 'npm run build')) {
    hasErrors = true;
  }
  
  // Run backend build check
  if (!runCheck('Backend build', 'npm run build', 'backend')) {
    hasErrors = true;
  }
  
  // Final result
  console.log('==========================================');
  if (hasErrors) {
    console.log('❌ Pre-deployment verification FAILED');
    console.log('');
    console.log('🔧 Please fix the errors above before deploying');
    console.log('📝 Check the error messages and resolve any issues');
    process.exit(1);
  } else {
    console.log('✅ Pre-deployment verification PASSED');
    console.log('');
    console.log('🚀 Ready for deployment!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Set up MongoDB Atlas cluster');
    console.log('   2. Configure environment variables in Vercel');
    console.log('   3. Deploy to Vercel: vercel --prod');
    console.log('   4. Run database seeding: npm run deploy:seed');
    console.log('   5. Test the deployment with: ./scripts/verify-deployment.sh <url>');
  }
}

// Run the check
runPreDeploymentCheck().catch(error => {
  console.error('❌ Pre-deployment check failed:', error);
  process.exit(1);
});
