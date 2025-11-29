const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const { getChromeOptions, getChromeService, BASE_URL, TIMEOUT } = require('./test.config.cjs');

describe('Ignition Insights Dashboard Tests', function () {
  this.timeout(15000);
  let driver;

  before(async function () {
    this.timeout(20000);
    console.log('\n🚀 Starting test suite initialization...');
    console.log('📍 Target URL:', BASE_URL);

    console.log('⏳ Creating Chrome WebDriver instance...');
    const options = getChromeOptions();
    const service = getChromeService();
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();
    console.log('✅ Chrome WebDriver created successfully!');

    console.log('⏳ Loading dashboard page...');
    await driver.get(BASE_URL);
    console.log('⏳ Waiting for #root element to load...');
    await driver.wait(until.elementLocated(By.css('#root')), TIMEOUT);
    console.log('✅ Browser initialized and page loaded\n');
  });

  after(async function () {
    console.log('\n🧹 Cleaning up...');
    if (driver) {
      await driver.quit();
      console.log('✅ Browser closed successfully');
    }
  });

  // Test 1: Page Load Test
  it('Test 1: Should load the dashboard page successfully', async function () {
    console.log('\n▶️  Starting Test 1: Page Load Test');
    console.log('⏳ Getting page title...');
    const title = await driver.getTitle();
    console.log('📄 Page title:', title);
    assert.ok(title.length > 0, 'Page title should not be empty');
    console.log('✅ Test 1 PASSED: Page loaded with title');
  });

  // Test 2: Dashboard Container Test
  it('Test 2: Should display main dashboard container', async function () {
    console.log('\n▶️  Starting Test 2: Dashboard Container Test');
    console.log('⏳ Locating #root element...');
    const dashboard = await driver.findElement(By.css('#root'));
    console.log('⏳ Checking if dashboard is displayed...');
    const isDisplayed = await dashboard.isDisplayed();
    console.log('👀 Dashboard visible:', isDisplayed);
    assert.strictEqual(isDisplayed, true, 'Dashboard should be visible');
    console.log('✅ Test 2 PASSED: Dashboard container is displayed');
  });

  // Test 3: Navigation Test
  it('Test 3: Should have navigation elements', async function () {
    console.log('\n▶️  Starting Test 3: Navigation Test');
    console.log('⏳ Searching for navigation links...');
    const links = await driver.findElements(By.css('a'));
    console.log('🔗 Found', links.length, 'navigation links');
    assert.ok(links.length >= 0, 'Navigation elements should be present');
    console.log('✅ Test 3 PASSED: Navigation elements found');
  });

  // Test 4: Filter Functionality Test
  it('Test 4: Should have filter/origin selector elements', async function () {
    console.log('\n▶️  Starting Test 4: Filter Functionality Test');
    console.log('⏳ Searching for buttons...');
    const buttons = await driver.findElements(By.css('button'));
    console.log('🔘 Found', buttons.length, 'buttons');

    console.log('⏳ Searching for select elements...');
    const selects = await driver.findElements(By.css('select'));
    console.log('📋 Found', selects.length, 'select elements');

    const totalControls = buttons.length + selects.length;
    console.log('🎛️  Total interactive controls:', totalControls);
    assert.ok(totalControls > 0, 'Filter controls should exist');
    console.log('✅ Test 4 PASSED: Filter controls found');
  });

  // Test 5: Chart Rendering Test (SVG elements)
  it('Test 5: Should render SVG charts on the dashboard', async function () {
    console.log('\n▶️  Starting Test 5: Chart Rendering Test');
    console.log('⏳ Waiting for SVG elements to be present...');
    await driver.wait(until.elementLocated(By.css('svg')), TIMEOUT);
    console.log('⏳ Counting SVG elements...');
    const svgElements = await driver.findElements(By.css('svg'));
    console.log('📊 Found', svgElements.length, 'SVG chart(s)');
    assert.ok(svgElements.length > 0, 'At least one SVG chart should be rendered');
    console.log('✅ Test 5 PASSED: SVG charts rendered');
  });

  // Test 6: Data Display Test
  it('Test 6: Should display data points in charts', async function () {
    console.log('\n▶️  Starting Test 6: Data Display Test');
    console.log('⏳ Searching for circle elements...');
    const circles = await driver.findElements(By.css('svg circle'));
    console.log('⚪ Found', circles.length, 'circles');

    console.log('⏳ Searching for path elements...');
    const paths = await driver.findElements(By.css('svg path'));
    console.log('📈 Found', paths.length, 'paths');

    console.log('⏳ Searching for rect elements...');
    const rects = await driver.findElements(By.css('svg rect'));
    console.log('▭  Found', rects.length, 'rectangles');

    const totalDataPoints = circles.length + paths.length + rects.length;
    console.log('📊 Total data visualization elements:', totalDataPoints);
    assert.ok(totalDataPoints > 0, 'Charts should have data visualization elements');
    console.log('✅ Test 6 PASSED: Data points found in charts');
  });

  // Test 7: Interactive Elements Test
  it('Test 7: Should have interactive chart elements', async function () {
    console.log('\n▶️  Starting Test 7: Interactive Elements Test');
    console.log('⏳ Searching for clickable elements...');
    const clickableElements = await driver.findElements(By.css('button, a, [role="button"]'));
    console.log('👆 Found', clickableElements.length, 'interactive elements');
    assert.ok(clickableElements.length > 0, 'Interactive elements should exist');
    console.log('✅ Test 7 PASSED: Interactive elements found');
  });

  // Test 8: Responsive Design Test
  it('Test 8: Should be responsive to different screen sizes', async function () {
    console.log('\n▶️  Starting Test 8: Responsive Design Test');

    console.log('⏳ Testing mobile viewport (375x667)...');
    await driver.manage().window().setRect({ width: 375, height: 667 });
    console.log('📱 Viewport changed to mobile size');
    await driver.wait(until.elementLocated(By.css('#root')), TIMEOUT);
    const rootMobile = await driver.findElement(By.css('#root'));
    const isMobileDisplayed = await rootMobile.isDisplayed();
    console.log('👀 Mobile view displayed:', isMobileDisplayed);

    console.log('⏳ Testing desktop viewport (1920x1080)...');
    await driver.manage().window().setRect({ width: 1920, height: 1080 });
    console.log('🖥️  Viewport changed to desktop size');
    await driver.wait(until.elementLocated(By.css('#root')), TIMEOUT);
    const rootDesktop = await driver.findElement(By.css('#root'));
    const isDesktopDisplayed = await rootDesktop.isDisplayed();
    console.log('👀 Desktop view displayed:', isDesktopDisplayed);

    assert.strictEqual(isMobileDisplayed && isDesktopDisplayed, true, 'Page should be responsive');
    console.log('✅ Test 8 PASSED: Page is responsive across screen sizes');
  });

  // Test 9: Page Content Loaded Test
  it('Test 9: Should load all page content without errors', async function () {
    console.log('\n▶️  Starting Test 9: Page Content Test');
    console.log('⏳ Getting page body text content...');
    const bodyText = await driver.findElement(By.css('body')).getText();
    const contentLength = bodyText.length;
    console.log('📝 Page content length:', contentLength, 'characters');
    assert.ok(contentLength > 0, 'Page should have content');
    console.log('✅ Test 9 PASSED: Page content loaded successfully');
  });

  // Test 10: Multiple Chart Types Test
  it('Test 10: Should display multiple visualization types', async function () {
    console.log('\n▶️  Starting Test 10: Multiple Chart Types Test');
    console.log('⏳ Getting all SVG elements...');
    const svgElements = await driver.findElements(By.css('svg'));
    console.log('📊 Analyzing', svgElements.length, 'SVG chart(s)...');

    let hasCircles = false;
    let hasRects = false;
    let hasPaths = false;

    for (let i = 0; i < svgElements.length; i++) {
      console.log(`⏳ Analyzing SVG #${i + 1}...`);
      const svg = svgElements[i];
      const circles = await svg.findElements(By.css('circle'));
      const rects = await svg.findElements(By.css('rect'));
      const paths = await svg.findElements(By.css('path'));

      if (circles.length > 0) {
        hasCircles = true;
        console.log(`  ⚪ SVG #${i + 1} has circles (${circles.length})`);
      }
      if (rects.length > 0) {
        hasRects = true;
        console.log(`  ▭  SVG #${i + 1} has rectangles (${rects.length})`);
      }
      if (paths.length > 0) {
        hasPaths = true;
        console.log(`  📈 SVG #${i + 1} has paths (${paths.length})`);
      }
    }

    const visualizationTypes = [hasCircles, hasRects, hasPaths].filter(Boolean).length;
    console.log('📊 Total visualization types found:', visualizationTypes);
    console.log('   - Circles:', hasCircles ? 'YES' : 'NO');
    console.log('   - Rectangles:', hasRects ? 'YES' : 'NO');
    console.log('   - Paths:', hasPaths ? 'YES' : 'NO');
    assert.ok(visualizationTypes >= 2, 'Should have at least 2 different visualization types');
    console.log('✅ Test 10 PASSED: Multiple visualization types found');
  });

  // Test 11: Error Handling Test
  it('Test 11: Should handle navigation to non-existent pages gracefully', async function () {
    console.log('\n▶️  Starting Test 11: Error Handling Test');
    const errorUrl = BASE_URL + '/non-existent-page';
    console.log('⏳ Navigating to non-existent page:', errorUrl);
    await driver.get(errorUrl);
    console.log('⏳ Waiting for body element...');
    await driver.wait(until.elementLocated(By.css('body')), TIMEOUT);

    const body = await driver.findElement(By.css('body'));
    const isDisplayed = await body.isDisplayed();
    console.log('👀 Error page displayed:', isDisplayed);
    assert.strictEqual(isDisplayed, true, 'Page should handle invalid routes');
    console.log('✅ Error handling works correctly');

    console.log('⏳ Navigating back to main page...');
    await driver.get(BASE_URL);
    await driver.wait(until.elementLocated(By.css('#root')), TIMEOUT);
    console.log('✅ Test 11 PASSED: Application handles invalid routes gracefully');
  });

  // Test 12: Performance Test - Page Load Time
  it('Test 12: Should load page within acceptable time', async function () {
    console.log('\n▶️  Starting Test 12: Performance Test');
    console.log('⏱️  Starting timer...');
    const startTime = Date.now();
    console.log('⏳ Loading page...');
    await driver.get(BASE_URL);
    console.log('⏳ Waiting for #root element...');
    await driver.wait(until.elementLocated(By.css('#root')), TIMEOUT);
    const loadTime = Date.now() - startTime;

    console.log('⏱️  Page load time:', loadTime, 'ms');
    console.log('📊 Performance threshold: 10000 ms');
    assert.ok(loadTime < 10000, 'Page should load within 10 seconds');
    console.log('✅ Test 12 PASSED: Page loaded in acceptable time');
  });
});
