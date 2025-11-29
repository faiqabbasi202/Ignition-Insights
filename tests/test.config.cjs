// Test configuration for Selenium WebDriver
const chrome = require('selenium-webdriver/chrome');

const getChromeOptions = () => {
  const options = new chrome.Options();
  
  // Headless mode for CI/CD environments
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--disable-extensions');
  options.addArguments('--disable-setuid-sandbox');
  
  return options;
};

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TIMEOUT = 10000;

module.exports = {
  getChromeOptions,
  BASE_URL,
  TIMEOUT
};
