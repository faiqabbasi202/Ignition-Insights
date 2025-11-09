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
          sh '''
            ssh -o StrictHostKeyChecking=no -i "$KEYFILE" $USER@${EC2_HOST} '
              set -e
              cd ~/assignment2/Ignition-Insights
              # Ensure repo on EC2 has latest code from GitHub
              git fetch origin
              git reset --hard origin/main
              # Bring Part-2 up using code volume (no Dockerfile build)
              WORKSPACE="$PWD" docker compose -f docker-compose.ci.yml up -d
            '
          '''
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
            ssh -o StrictHostKeyChecking=no -i "$KEYFILE" $USER@${EC2_HOST} '
              set -e
              c=$(docker ps --format "{{.Names}}" | grep a2-app-ci | head -n1 || true)
              if [ -z "$c" ]; then
                echo "a2-app-ci container not found"
                docker ps
                exit 1
              fi
              echo "Monitoring container: $c"

              for i in \$(seq 1 120); do
                state=\$(docker inspect -f "{{.State.Health.Status}}" "$c" 2>/dev/null || echo "starting")
                echo "a2-app-ci health: \$state (\$i/120)"
                if [ "\$state" = "healthy" ]; then
                  echo "Container is healthy. Probing HTTP..."
                  curl -fsSI http://127.0.0.1:8081/ && exit 0
                fi
                sleep 4
              done

              echo "App did not become healthy on 8081 in time"
              docker logs --tail=200 "$c" || true
              exit 1
            '
          """
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
    success { echo '✅ Build & Deploy OK' }
    failure { echo '❌ Deployment failed — check console log' }
    always  { sh 'df -h || true' }
  }
}

