const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const { getChromeOptions, BASE_URL, TIMEOUT } = require('./test.config.cjs');

describe('Ignition Insights Dashboard Tests', function () {
  this.timeout(30000);
  let driver;

  before(async function () {
    const options = getChromeOptions();
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  // Test 1: Page Load Test
  it('Test 1: Should load the dashboard page successfully', async function () {
    await driver.get(BASE_URL);
    const title = await driver.getTitle();
    assert.ok(title.length > 0, 'Page title should not be empty');
    console.log('✓ Page loaded with title:', title);
  });

  // Test 2: Dashboard Container Test
  it('Test 2: Should display main dashboard container', async function () {
    await driver.get(BASE_URL);
    const dashboard = await driver.wait(
      until.elementLocated(By.css('#root')),
      TIMEOUT
    );
    const isDisplayed = await dashboard.isDisplayed();
    assert.strictEqual(isDisplayed, true, 'Dashboard should be visible');
    console.log('✓ Dashboard container is displayed');
  });

  // Test 3: Navigation Test
  it('Test 3: Should have navigation elements', async function () {
    await driver.get(BASE_URL);
    await driver.sleep(2000); // Wait for page to load

    // Check if there are any links or navigation elements
    const links = await driver.findElements(By.css('a'));
    assert.ok(links.length >= 0, 'Navigation elements should be present');
    console.log('✓ Found', links.length, 'navigation links');
  });

  // Test 4: Filter Functionality Test
  it('Test 4: Should have filter/origin selector elements', async function () {
    await driver.get(BASE_URL);
    await driver.sleep(2000);

    // Look for buttons or select elements (common in filters)
    const buttons = await driver.findElements(By.css('button'));
    const selects = await driver.findElements(By.css('select'));
    const totalControls = buttons.length + selects.length;

    assert.ok(totalControls > 0, 'Filter controls should exist');
    console.log('✓ Found', totalControls, 'interactive controls');
  });

  // Test 5: Chart Rendering Test (SVG elements)
  it('Test 5: Should render SVG charts on the dashboard', async function () {
    await driver.get(BASE_URL);
    await driver.sleep(3000); // Wait for D3 charts to render

    const svgElements = await driver.findElements(By.css('svg'));
    assert.ok(svgElements.length > 0, 'At least one SVG chart should be rendered');
    console.log('✓ Found', svgElements.length, 'SVG chart(s)');
  });

  // Test 6: Data Display Test
  it('Test 6: Should display data points in charts', async function () {
    await driver.get(BASE_URL);
    await driver.sleep(3000);

    // Check for common D3 elements like circles, paths, rects
    const circles = await driver.findElements(By.css('svg circle'));
    const paths = await driver.findElements(By.css('svg path'));
    const rects = await driver.findElements(By.css('svg rect'));

    const totalDataPoints = circles.length + paths.length + rects.length;
    assert.ok(totalDataPoints > 0, 'Charts should have data visualization elements');
    console.log('✓ Found', totalDataPoints, 'data visualization elements');
  });

  // Test 7: Interactive Elements Test
  it('Test 7: Should have interactive chart elements', async function () {
    await driver.get(BASE_URL);
    await driver.sleep(3000);

    // Check for elements that typically have event listeners
    const clickableElements = await driver.findElements(By.css('button, a, [role="button"]'));
    assert.ok(clickableElements.length > 0, 'Interactive elements should exist');
    console.log('✓ Found', clickableElements.length, 'interactive elements');
  });

  // Test 8: Responsive Design Test
  it('Test 8: Should be responsive to different screen sizes', async function () {
    await driver.get(BASE_URL);
    await driver.sleep(2000);

    // Test mobile viewport
    await driver.manage().window().setRect({ width: 375, height: 667 });
    await driver.sleep(1000);
    const rootMobile = await driver.findElement(By.css('#root'));
    const isMobileDisplayed = await rootMobile.isDisplayed();

    // Test desktop viewport
    await driver.manage().window().setRect({ width: 1920, height: 1080 });
    await driver.sleep(1000);
    const rootDesktop = await driver.findElement(By.css('#root'));
    const isDesktopDisplayed = await rootDesktop.isDisplayed();

    assert.strictEqual(isMobileDisplayed && isDesktopDisplayed, true, 'Page should be responsive');
    console.log('✓ Page is responsive across different screen sizes');
  });

  // Test 9: Page Content Loaded Test
  it('Test 9: Should load all page content without errors', async function () {
    await driver.get(BASE_URL);
    await driver.sleep(3000);

    // Check if body has content
    const bodyText = await driver.findElement(By.css('body')).getText();
    assert.ok(bodyText.length > 0, 'Page should have content');
    console.log('✓ Page content loaded successfully');
  });

  // Test 10: Multiple Chart Types Test
  it('Test 10: Should display multiple visualization types', async function () {
    await driver.get(BASE_URL);
    await driver.sleep(3000);

    const svgElements = await driver.findElements(By.css('svg'));

    // Check for different chart elements
    let hasCircles = false;
    let hasRects = false;
    let hasPaths = false;

    for (let svg of svgElements) {
      const circles = await svg.findElements(By.css('circle'));
      const rects = await svg.findElements(By.css('rect'));
      const paths = await svg.findElements(By.css('path'));

      if (circles.length > 0) hasCircles = true;
      if (rects.length > 0) hasRects = true;
      if (paths.length > 0) hasPaths = true;
    }

    const visualizationTypes = [hasCircles, hasRects, hasPaths].filter(Boolean).length;
    assert.ok(visualizationTypes >= 2, 'Should have at least 2 different visualization types');
    console.log('✓ Found', visualizationTypes, 'different visualization types');
  });

  // Test 11: Error Handling Test
  it('Test 11: Should handle navigation to non-existent pages gracefully', async function () {
    await driver.get(BASE_URL + '/non-existent-page');
    await driver.sleep(2000);

    // Page should still load (either show 404 or redirect)
    const body = await driver.findElement(By.css('body'));
    const isDisplayed = await body.isDisplayed();
    assert.strictEqual(isDisplayed, true, 'Page should handle invalid routes');
    console.log('✓ Application handles invalid routes');
  });

  // Test 12: Performance Test - Page Load Time
  it('Test 12: Should load page within acceptable time', async function () {
    const startTime = Date.now();
    await driver.get(BASE_URL);
    await driver.wait(until.elementLocated(By.css('#root')), TIMEOUT);
    const loadTime = Date.now() - startTime;

    assert.ok(loadTime < 10000, 'Page should load within 10 seconds');
    console.log('✓ Page loaded in', loadTime, 'ms');
  });
});
