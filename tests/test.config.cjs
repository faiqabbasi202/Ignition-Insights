// Test configuration for Selenium WebDriver
const chrome = require('selenium-webdriver/chrome');
const path = require('path');

const getChromeOptions = () => {
  const options = new chrome.Options();

  // Set Brave browser binary path (user-specific installation)
  const os = require('os');
  const bravePath = path.join(os.homedir(), 'AppData', 'Local', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe');
  options.setChromeBinaryPath(bravePath);

  // Headless mode and stability arguments
  options.addArguments('--headless=new');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-extensions');
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--disable-blink-features=AutomationControlled');
  options.addArguments('--disable-setuid-sandbox');
  options.addArguments('--remote-debugging-port=9222');

  return options;
};

const getChromeService = () => {
  // Use the installed chromedriver from node_modules
  const chromedriverPath = path.join(__dirname, '..', 'node_modules', 'chromedriver', 'lib', 'chromedriver', 'chromedriver.exe');
  const service = new chrome.ServiceBuilder(chromedriverPath);
  return service;
};

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TIMEOUT = 10000;

module.exports = {
  getChromeOptions,
  getChromeService,
  BASE_URL,
  TIMEOUT
};
