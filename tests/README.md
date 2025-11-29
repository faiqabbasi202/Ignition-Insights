# Selenium Test Suite for Ignition Insights Dashboard

## Overview
This directory contains automated Selenium tests for the Ignition Insights Dashboard application. The tests are written in JavaScript using Mocha test framework and Selenium WebDriver.

## Test Cases

### 1. Page Load Test
- Verifies that the dashboard page loads successfully
- Checks that page title is not empty

### 2. Dashboard Container Test
- Ensures the main dashboard container (#root) is displayed
- Validates that core UI elements are present

### 3. Navigation Test
- Checks for navigation elements (links)
- Verifies navigation structure exists

### 4. Filter Functionality Test
- Looks for filter/origin selector elements
- Validates interactive control elements (buttons, selects)

### 5. Chart Rendering Test (SVG)
- Confirms that SVG charts are rendered on the dashboard
- Verifies D3.js visualizations are present

### 6. Data Display Test
- Checks for data visualization elements (circles, paths, rects)
- Ensures charts contain actual data points

### 7. Interactive Elements Test
- Validates presence of clickable/interactive elements
- Tests user interaction capabilities

### 8. Responsive Design Test
- Tests application on mobile viewport (375x667)
- Tests application on desktop viewport (1920x1080)
- Verifies responsive behavior across screen sizes

### 9. Page Content Loaded Test
- Confirms all page content loads without errors
- Validates that body has meaningful content

### 10. Multiple Chart Types Test
- Verifies multiple visualization types are present
- Checks for variety in chart elements (circles, rectangles, paths)

### 11. Error Handling Test
- Tests navigation to non-existent pages
- Verifies graceful error handling

### 12. Performance Test
- Measures page load time
- Ensures page loads within 10 seconds

## Running Tests

### Locally
```bash
# Start the dev server first
npm run dev

# In another terminal, run tests
npm test
```

### With Docker
```bash
# Build test image
docker build -f Dockerfile.test -t ignition-tests:latest .

# Run tests
docker run --rm --network="host" -e BASE_URL=http://localhost:5173 ignition-tests:latest
```

### In Jenkins Pipeline
Tests are automatically executed in the CI/CD pipeline when code is pushed to GitHub.

## Test Configuration

- **Framework**: Mocha
- **Browser**: Chrome (Headless mode)
- **Reporter**: Mochawesome (HTML + JSON reports)
- **Timeout**: 30 seconds per test
- **Report Location**: `test-results/`

## Environment Variables

- `BASE_URL`: URL of the application to test (default: http://localhost:5173)
- `CHROME_BIN`: Path to Chrome binary (set automatically in Docker)

## Dependencies

- selenium-webdriver: ^4.38.0
- chromedriver: ^142.0.3
- mocha: ^11.7.5
- mochawesome: ^7.1.4
- mochawesome-report-generator: ^6.3.2
