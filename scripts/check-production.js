#!/usr/bin/env node

/**
 * Production Readiness Check Script
 * 
 * This script checks if your Next.js application is ready for deployment to Vercel.
 * It validates environment variables, checks for required files, and runs other checks.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

console.log(`${colors.bold}${colors.blue}=== Production Readiness Check ====${colors.reset}\n`);

let allPassed = true;
const issues = [];

// Check for next.config.js or next.config.ts
function checkNextConfig() {
  console.log(`${colors.bold}Checking Next.js config...${colors.reset}`);
  const nextConfigJs = fs.existsSync(path.join(process.cwd(), 'next.config.js'));
  const nextConfigTs = fs.existsSync(path.join(process.cwd(), 'next.config.ts'));
  
  if (!nextConfigJs && !nextConfigTs) {
    allPassed = false;
    issues.push('❌ Missing next.config.js or next.config.ts file');
    console.log(`${colors.red}❌ Missing next.config.js or next.config.ts file${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Found Next.js config file${colors.reset}`);
  }
  console.log();
}

// Check for required environment variables in .env.local or process.env
function checkEnvironmentVariables() {
  console.log(`${colors.bold}Checking environment variables...${colors.reset}`);
  
  const requiredVars = [
    'AUTH_SECRET',
    'POSTGRES_URL',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'BLOB_READ_WRITE_TOKEN'
  ];
  
  // Check if .env.production exists as a template
  const envProductionExists = fs.existsSync(path.join(process.cwd(), '.env.production'));
  if (!envProductionExists) {
    console.log(`${colors.yellow}⚠️ Missing .env.production template file (not critical but recommended)${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Found .env.production template${colors.reset}`);
  }
  
  // Check .env.local for development
  let envLocalContent = '';
  const envLocalExists = fs.existsSync(path.join(process.cwd(), '.env.local'));
  if (envLocalExists) {
    envLocalContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
    console.log(`${colors.green}✅ Found .env.local file${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️ Missing .env.local file for development${colors.reset}`);
  }
  
  // Check for required variables
  for (let i = 0; i < requiredVars.length; i++) {
    const variable = requiredVars[i];
    if (process.env[variable] || (envLocalContent && envLocalContent.includes(`${variable}=`))) {
      console.log(`${colors.green}✅ ${variable} is configured${colors.reset}`);
    } else {
      allPassed = false;
      issues.push(`❌ Missing required environment variable: ${variable}`);
      console.log(`${colors.red}❌ Missing required environment variable: ${variable}${colors.reset}`);
    }
  }
  console.log();
}

// Check package.json for build script
function checkPackageJson() {
  console.log(`${colors.bold}Checking package.json...${colors.reset}`);
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    
    // Check build script
    if (!packageJson.scripts || !packageJson.scripts.build) {
      allPassed = false;
      issues.push('❌ Missing build script in package.json');
      console.log(`${colors.red}❌ Missing build script in package.json${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Build script found${colors.reset}`);
    }
    
    // Check start script
    if (!packageJson.scripts || !packageJson.scripts.start) {
      allPassed = false;
      issues.push('❌ Missing start script in package.json');
      console.log(`${colors.red}❌ Missing start script in package.json${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Start script found${colors.reset}`);
    }
    
    // Check for Vercel dependencies
    const dependencies = {};
    Object.keys(packageJson.dependencies || {}).forEach(function(dep) {
      dependencies[dep] = packageJson.dependencies[dep];
    });
    Object.keys(packageJson.devDependencies || {}).forEach(function(dep) {
      dependencies[dep] = packageJson.devDependencies[dep];
    });
    
    const requiredDeps = ['next', 'react', 'react-dom'];
    
    for (let i = 0; i < requiredDeps.length; i++) {
      const dep = requiredDeps[i];
      if (!dependencies[dep]) {
        allPassed = false;
        issues.push(`❌ Missing required dependency: ${dep}`);
        console.log(`${colors.red}❌ Missing required dependency: ${dep}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Required dependency found: ${dep}${colors.reset}`);
      }
    }
  } catch (error) {
    allPassed = false;
    issues.push('❌ Error reading package.json');
    console.log(`${colors.red}❌ Error reading package.json: ${error.message}${colors.reset}`);
  }
  console.log();
}

// Check Vercel configuration
function checkVercelConfig() {
  console.log(`${colors.bold}Checking Vercel configuration...${colors.reset}`);
  
  const vercelConfigExists = fs.existsSync(path.join(process.cwd(), 'vercel.json'));
  if (!vercelConfigExists) {
    console.log(`${colors.yellow}⚠️ No vercel.json found (not required but can be useful)${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ vercel.json found${colors.reset}`);
    
    try {
      const vercelConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'));
      console.log(`${colors.green}✅ vercel.json is valid JSON${colors.reset}`);
      
      if (!vercelConfig.version) {
        console.log(`${colors.yellow}⚠️ No version specified in vercel.json${colors.reset}`);
      }
    } catch (error) {
      allPassed = false;
      issues.push('❌ Invalid vercel.json');
      console.log(`${colors.red}❌ Invalid vercel.json: ${error.message}${colors.reset}`);
    }
  }
  console.log();
}

// Run checks
checkNextConfig();
checkEnvironmentVariables();
checkPackageJson();
checkVercelConfig();

// Final summary
console.log(`${colors.bold}${colors.blue}=== Summary ====${colors.reset}\n`);

if (allPassed) {
  console.log(`${colors.green}${colors.bold}✅ All checks passed! Your app is ready for deployment to Vercel.${colors.reset}\n`);
} else {
  console.log(`${colors.red}${colors.bold}❌ Some checks failed. Please address the issues before deploying to Vercel:${colors.reset}\n`);
  
  for (let i = 0; i < issues.length; i++) {
    console.log(`${colors.red}${i + 1}. ${issues[i]}${colors.reset}`);
  }
  
  console.log();
}

// Deployment instructions
console.log(`${colors.bold}${colors.blue}=== Deployment Instructions ====${colors.reset}\n`);
console.log(`To deploy to Vercel:

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy!

Alternatively, use the Vercel CLI:
${colors.bold}vercel${colors.reset} (for development preview)
${colors.bold}vercel --prod${colors.reset} (for production deployment)
`);

process.exit(allPassed ? 0 : 1); 
