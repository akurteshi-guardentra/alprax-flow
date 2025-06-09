// Script to deploy to GitHub Pages with more control
const { execSync } = require('child_process');
const ghpages = require('gh-pages');
const fs = require('fs');
const path = require('path');

// Configuration
const distFolder = 'dist';
const repoUrl = 'https://github.com/atdheekurteshi/alprax-flow.git';
const branch = 'gh-pages';

// Ensure the dist folder exists
if (!fs.existsSync(path.join(process.cwd(), distFolder))) {
  console.error(`Error: '${distFolder}' folder not found. Did you run 'npm run build:github-pages' first?`);
  process.exit(1);
}

// Get Git user info
let name, email;
try {
  name = execSync('git config user.name').toString().trim();
  email = execSync('git config user.email').toString().trim();
} catch (error) {
  name = 'GitHub Pages Deployer';
  email = 'no-reply@github.com';
}

console.log(`Deploying to GitHub Pages from ${distFolder} folder...`);
console.log(`Repository: ${repoUrl}`);
console.log(`Branch: ${branch}`);
console.log(`User: ${name} <${email}>`);

// Deploy
ghpages.publish(
  distFolder,
  {
    branch: branch,
    repo: repoUrl,
    message: `Deploy to GitHub Pages - ${new Date().toISOString()}`,
    user: {
      name: name,
      email: email,
    },
    dotfiles: true,
    verbose: true
  },
  (err) => {
    if (err) {
      console.error('Deployment error:', err);
      process.exit(1);
    } else {
      console.log('Deployment successful! Your site should be live shortly at:');
      console.log('https://atdheekurteshi.github.io/alprax-flow/');
    }
  }
);
