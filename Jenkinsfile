// Triggers build automatically on GitHub push (requires GitHub plugin + webhook)
properties([pipelineTriggers([githubPush()])])

pipeline {
  agent any

  environment {
    EC2_HOST = '44.222.229.138'   // update if your public IP changes
  }

  options {
    disableConcurrentBuilds()
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Deploy Part-2 (Compose + Volume)') {
      steps {
        withCredentials([sshUserPrivateKey(
          credentialsId: 'ec2-ssh',
          keyFileVariable: 'KEYFILE',
          usernameVariable: 'USER'
        )]) {
          sh """
            ssh -o StrictHostKeyChecking=no -i "\$KEYFILE" \$USER@${EC2_HOST} '
              set -e
              cd ~/assignment2/Ignition-Insights
              # Ensure repo on EC2 has latest code from GitHub
              git fetch origin
              git reset --hard origin/main
              # Bring Part-2 up using code volume (no Dockerfile build)
              WORKSPACE="\$PWD" docker compose -f docker-compose.ci.yml up -d
            '
          """
        }
      }
    }

    stage('Wait for Health (8081)') {
      steps {
        withCredentials([sshUserPrivateKey(
          credentialsId: 'ec2-ssh',
          keyFileVariable: 'KEYFILE',
          usernameVariable: 'USER'
        )]) {
          sh """
            ssh -o StrictHostKeyChecking=no -i "\$KEYFILE" \$USER@${EC2_HOST} '
              set -e
              c=\$(docker ps --format "{{.Names}}" | grep a2-app-ci | head -n1 || true)
              if [ -z "\$c" ]; then
                echo "a2-app-ci container not found"
                docker ps
                exit 1
              fi
              echo "Monitoring container: \$c"

              for i in \$(seq 1 120); do
                state=\$(docker inspect -f "{{.State.Health.Status}}" "\$c" 2>/dev/null || echo "starting")
                echo "a2-app-ci health: \$state (\$i/120)"
                if [ "\$state" = "healthy" ]; then
                  echo "Container is healthy. Probing HTTP..."
                  curl -fsSI http://127.0.0.1:8081/ && exit 0
                fi
                sleep 4
              done

              echo "App did not become healthy on 8081 in time"
              docker logs --tail=200 "\$c" || true
              exit 1
            '
          """
        }
      }
    }

    stage('Run Selenium Tests') {
      steps {
        script {
          try {
            // Build test Docker image
            sh 'docker build -f Dockerfile.test -t ignition-tests:latest .'
            
            // Run tests in Docker container
            sh """
              docker run --rm \
                --network="host" \
                -e BASE_URL=http://localhost:8081 \
                ignition-tests:latest
            """
          } catch (Exception e) {
            currentBuild.result = 'UNSTABLE'
            echo "⚠️ Tests failed: ${e.message}"
          }
        }
      }
    }

    stage('Light Cleanup (Jenkins node)') {
      steps {
        sh '''
          docker image prune -f || true
          docker builder prune -f || true
        '''
      }
    }
  }

  post {
    success { 
      echo '✅ Build & Deploy OK'
      emailext(
        subject: "Jenkins Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: """
          <h2>Build Successful ✅</h2>
          <p><b>Job:</b> ${env.JOB_NAME}</p>
          <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
          <p><b>Build URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
          <p><b>Test Results:</b> All tests passed</p>
          <p><b>Triggered by:</b> ${env.CHANGE_AUTHOR ?: 'Unknown'}</p>
        """,
        mimeType: 'text/html',
        to: "${env.CHANGE_AUTHOR_EMAIL ?: 'faiq.abbasi2005@gmail.com'}",
        from: 'jenkins@devops.com'
      )
    }
    failure { 
      echo '❌ Deployment failed — check console log'
      emailext(
        subject: "Jenkins Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: """
          <h2>Build Failed ❌</h2>
          <p><b>Job:</b> ${env.JOB_NAME}</p>
          <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
          <p><b>Build URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
          <p><b>Console Output:</b> <a href="${env.BUILD_URL}console">${env.BUILD_URL}console</a></p>
          <p><b>Triggered by:</b> ${env.CHANGE_AUTHOR ?: 'Unknown'}</p>
        """,
        mimeType: 'text/html',
        to: "${env.CHANGE_AUTHOR_EMAIL ?: 'faiq.abbasi2005@gmail.com'}",
        from: 'jenkins@devops.com'
      )
    }
    unstable {
      emailext(
        subject: "Jenkins Build Unstable (Tests Failed): ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: """
          <h2>Build Unstable ⚠️</h2>
          <p><b>Job:</b> ${env.JOB_NAME}</p>
          <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
          <p><b>Issue:</b> Some tests failed</p>
          <p><b>Build URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
          <p><b>Test Report:</b> <a href="${env.BUILD_URL}testReport/">${env.BUILD_URL}testReport/</a></p>
          <p><b>Triggered by:</b> ${env.CHANGE_AUTHOR ?: 'Unknown'}</p>
        """,
        mimeType: 'text/html',
        to: "${env.CHANGE_AUTHOR_EMAIL ?: 'faiq.abbasi2005@gmail.com'}",
        from: 'jenkins@devops.com'
      )
    }
    always  { sh 'df -h || true' }
  }
}

