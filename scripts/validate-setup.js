#!/usr/bin/env node

/**
 * SocialSync Development Environment Validation Script
 * 
 * This script validates that all components of the development environment
 * are properly configured and can communicate with each other.
 */

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  backend: {
    url: 'http://localhost:8080/api/v1/health',
    name: 'Backend API'
  },
  frontend: {
    url: 'http://localhost:3000',
    name: 'Frontend Web App'
  },
  database: {
    host: 'localhost',
    port: 5432,
    name: 'PostgreSQL Database'
  },
  redis: {
    host: 'localhost',
    port: 6379,
    name: 'Redis Cache'
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * Print colored console output
 */
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print section header
 */
function printHeader(title) {
  print(`\n${colors.bold}=== ${title} ===${colors.reset}`, 'blue');
}

/**
 * Print success message
 */
function printSuccess(message) {
  print(`✅ ${message}`, 'green');
}

/**
 * Print error message
 */
function printError(message) {
  print(`❌ ${message}`, 'red');
}

/**
 * Print warning message
 */
function printWarning(message) {
  print(`⚠️  ${message}`, 'yellow');
}

/**
 * Make HTTP request
 */
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, { timeout }, (response) => {
      resolve({
        statusCode: response.statusCode,
        headers: response.headers
      });
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Execute shell command
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Validate project structure
 */
async function validateProjectStructure() {
  printHeader('Project Structure Validation');

  const requiredFiles = [
    'Backend/pom.xml',
    'Backend/src/main/java/com/socialsync/SocialSyncApplication.java',
    'Backend/src/main/resources/application.yml',
    'Frontend/package.json',
    'Frontend/next.config.mjs',
    'Mobile/package.json',
    'docker-compose.yml',
    '.env'
  ];

  let allFilesExist = true;

  for (const file of requiredFiles) {
    if (fileExists(file)) {
      printSuccess(`Found: ${file}`);
    } else {
      printError(`Missing: ${file}`);
      allFilesExist = false;
    }
  }

  return allFilesExist;
}

/**
 * Validate system dependencies
 */
async function validateSystemDependencies() {
  printHeader('System Dependencies Validation');

  const dependencies = [
    { command: 'node --version', name: 'Node.js' },
    { command: 'npm --version', name: 'npm' },
    { command: 'java --version', name: 'Java' },
    { command: 'mvn --version', name: 'Maven' },
    { command: 'docker --version', name: 'Docker' }
  ];

  const results = [];

  for (const dep of dependencies) {
    try {
      const version = await executeCommand(dep.command);
      printSuccess(`${dep.name}: ${version.split('\n')[0]}`);
      results.push({ name: dep.name, status: 'ok', version });
    } catch (error) {
      printError(`${dep.name}: Not found or not working`);
      results.push({ name: dep.name, status: 'error', error: error.stderr });
    }
  }

  return results;
}

/**
 * Validate Docker services
 */
async function validateDockerServices() {
  printHeader('Docker Services Validation');

  try {
    const output = await executeCommand('docker-compose ps --format json');
    const services = output.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));

    if (services.length === 0) {
      printWarning('No Docker services are running. Run: docker-compose up -d postgres redis');
      return false;
    }

    for (const service of services) {
      if (service.State === 'running') {
        printSuccess(`${service.Service}: Running on port ${service.Publishers || 'N/A'}`);
      } else {
        printError(`${service.Service}: ${service.State}`);
      }
    }

    return services.every(service => service.State === 'running');
  } catch (error) {
    printError('Failed to check Docker services. Make sure Docker is running.');
    return false;
  }
}

/**
 * Validate service connectivity
 */
async function validateServiceConnectivity() {
  printHeader('Service Connectivity Validation');

  const services = [CONFIG.backend, CONFIG.frontend];
  const results = [];

  for (const service of services) {
    try {
      const response = await makeRequest(service.url);
      if (response.statusCode >= 200 && response.statusCode < 400) {
        printSuccess(`${service.name}: Accessible (HTTP ${response.statusCode})`);
        results.push({ name: service.name, status: 'ok', statusCode: response.statusCode });
      } else {
        printWarning(`${service.name}: Unexpected status code ${response.statusCode}`);
        results.push({ name: service.name, status: 'warning', statusCode: response.statusCode });
      }
    } catch (error) {
      printError(`${service.name}: ${error.message}`);
      results.push({ name: service.name, status: 'error', error: error.message });
    }
  }

  return results;
}

/**
 * Generate validation report
 */
function generateReport(results) {
  printHeader('Validation Summary');

  const { structure, dependencies, docker, connectivity } = results;

  print('\n📋 Project Structure:', 'bold');
  print(structure ? '✅ All required files found' : '❌ Some files are missing');

  print('\n🔧 System Dependencies:', 'bold');
  const workingDeps = dependencies.filter(dep => dep.status === 'ok').length;
  print(`✅ ${workingDeps}/${dependencies.length} dependencies working`);

  print('\n🐳 Docker Services:', 'bold');
  print(docker ? '✅ All services running' : '⚠️  Some services not running');

  print('\n🌐 Service Connectivity:', 'bold');
  const accessibleServices = connectivity.filter(service => service.status === 'ok').length;
  print(`✅ ${accessibleServices}/${connectivity.length} services accessible`);

  print('\n📝 Next Steps:', 'bold');
  if (!structure) {
    print('• Ensure all required project files are present');
  }
  if (dependencies.some(dep => dep.status === 'error')) {
    print('• Install missing system dependencies');
  }
  if (!docker) {
    print('• Start Docker services: docker-compose up -d postgres redis');
  }
  if (connectivity.some(service => service.status === 'error')) {
    print('• Start application services (Backend: mvn spring-boot:run, Frontend: npm run dev)');
  }

  const allGood = structure && 
                  dependencies.every(dep => dep.status === 'ok') && 
                  docker && 
                  connectivity.every(service => service.status === 'ok');

  if (allGood) {
    print('\n🎉 All validations passed! Your development environment is ready.', 'green');
  } else {
    print('\n⚠️  Some issues found. Please address them before proceeding.', 'yellow');
  }
}

/**
 * Main validation function
 */
async function main() {
  print('🚀 SocialSync Development Environment Validation', 'bold');
  print('This script will validate your development environment setup.\n');

  try {
    const structure = await validateProjectStructure();
    const dependencies = await validateSystemDependencies();
    const docker = await validateDockerServices();
    const connectivity = await validateServiceConnectivity();

    generateReport({ structure, dependencies, docker, connectivity });
  } catch (error) {
    printError(`Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  validateProjectStructure,
  validateSystemDependencies,
  validateDockerServices,
  validateServiceConnectivity
};
