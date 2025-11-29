# AWS EC2 Setup and Jenkins Configuration Guide

## Step 1: Connect to EC2 Instance

```bash
# Accept the SSH key fingerprint by typing "yes"
ssh -i ~/.ssh/mykey.pem ubuntu@13.217.231.190
# Type: yes

# Once connected, update the system
sudo apt update && sudo apt upgrade -y
```

## Step 2: Install Docker (if not already installed)

```bash
# Install Docker
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Log out and log back in for group changes to take effect
exit
# Then reconnect
ssh -i ~/.ssh/mykey.pem ubuntu@13.217.231.190
```

## Step 3: Install Jenkins (if not already installed)

```bash
# Install Java
sudo apt install -y openjdk-17-jdk

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install -y jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

## Step 4: Configure Jenkins

1. **Access Jenkins**: http://13.217.231.190:8080
2. **Initial Setup**: Use the password from the command above
3. **Install Suggested Plugins**

## Step 5: Install Required Jenkins Plugins

Go to: Manage Jenkins → Plugins → Available Plugins

Install:
- GitHub Integration Plugin
- Email Extension Plugin
- Docker Pipeline Plugin
- Pipeline Plugin

## Step 6: Configure Email in Jenkins

1. Go to: **Manage Jenkins → Configure System**
2. Scroll to **Extended E-mail Notification**:
   - SMTP server: smtp.gmail.com
   - SMTP Port: 465
   - Use SSL: ✓
   - Credentials: Add Gmail App Password
     - Click "Add" → "Jenkins"
     - Kind: Username with password
     - Username: your-email@gmail.com
     - Password: [Gmail App Password - not regular password]
     - ID: gmail-credentials

3. **Test Configuration**: Send test email

## Step 7: Add GitHub SSH Credentials to Jenkins

1. Go to: **Manage Jenkins → Credentials → System → Global credentials**
2. Click **Add Credentials**:
   - Kind: SSH Username with private key
   - ID: github-ssh
   - Username: git
   - Private Key: Enter directly (paste your SSH private key)

## Step 8: Create Jenkins Pipeline Job

1. **New Item** → Enter name: "Ignition-Insights-Pipeline"
2. Select **Pipeline** → OK
3. In Configuration:
   - **Build Triggers**: ✓ GitHub hook trigger for GITScm polling
   - **Pipeline**:
     - Definition: Pipeline script from SCM
     - SCM: Git
     - Repository URL: git@github.com:faiqabbasi202/Ignition-Insights.git
     - Credentials: github-ssh (select the one you just created)
     - Branch: */main
     - Script Path: Jenkinsfile

4. **Save**

## Step 9: Configure GitHub Webhook

1. Go to: https://github.com/faiqabbasi202/Ignition-Insights/settings/hooks
2. Click **Add webhook**:
   - Payload URL: http://13.217.231.190:8080/github-webhook/
   - Content type: application/json
   - Events: ✓ Just the push event
   - Active: ✓
3. **Add webhook**

## Step 10: Add Collaborator Email to Environment

In Jenkinsfile, update the email addresses or ensure Jenkins can capture git commit author email.

## Step 11: Test the Pipeline

```bash
# Make a small change and push
cd ~/path/to/Ignition-Insights
echo "# Test" >> README.md
git add .
git commit -m "Test Jenkins pipeline trigger"
git push
```

## Expected Flow:

1. ✅ Push to GitHub triggers webhook
2. ✅ Jenkins pulls latest code
3. ✅ Deploys application to Docker
4. ✅ Waits for health check
5. ✅ Builds test Docker image
6. ✅ Runs Selenium tests in container
7. ✅ Sends email with results

## Troubleshooting:

### If webhook doesn't trigger:
- Check GitHub webhook deliveries for errors
- Ensure port 8080 is open in EC2 security group
- Verify Jenkins GitHub Integration plugin is installed

### If tests fail:
- Check Docker is running: `docker ps`
- Check test container logs: `docker logs <container-id>`
- Verify Chrome is installed in test container

### If email doesn't send:
- Verify SMTP settings in Jenkins
- Check Gmail App Password is correct
- Test email configuration in Jenkins settings

## Important Notes:

- Update `EC2_HOST` in Jenkinsfile to: `13.217.231.190`
- Ensure Docker network mode is correct for your setup
- App should be accessible on port 8081 as per Jenkinsfile
