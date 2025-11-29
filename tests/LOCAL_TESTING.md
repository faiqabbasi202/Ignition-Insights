# Local Testing Note

## ⚠️ Important: Chrome Requirement

The Selenium tests require Google Chrome to be installed. If you're getting errors running tests locally:

### Option 1: Install Google Chrome
Download and install from: https://www.google.com/chrome/

### Option 2: Run Tests in Docker (Recommended)
The tests are designed to run in a Docker container which has Chrome pre-installed:

```bash
# Build the test Docker image
docker build -f Dockerfile.test -t ignition-tests:latest .

# Run tests in Docker
docker run --rm --network="host" -e BASE_URL=http://localhost:5173 ignition-tests:latest
```

### Option 3: Skip Local Testing
The tests will run automatically in Jenkins CI/CD pipeline when you push to GitHub. The Jenkins pipeline uses Docker containers with Chrome pre-installed.

## Why Docker?
- Chrome, ChromeDriver, and all dependencies are pre-configured
- Consistent environment between local, CI/CD, and production
- No manual browser installation required
- Headless mode works reliably

## Test Execution Flow in CI/CD
1. Push code to GitHub
2. Jenkins webhook triggers pipeline
3. Pipeline builds Docker test image
4. Tests run in Docker container
5. Results emailed to collaborators

✅ **The tests will work perfectly in the Jenkins pipeline even if they fail locally due to missing Chrome.**
