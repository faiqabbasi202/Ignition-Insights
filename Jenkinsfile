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
        sh '''
          echo "Probing http://127.0.0.1:8081/ ..."
          for i in $(seq 1 45); do
            if curl -fsSI "http://127.0.0.1:8081/" >/dev/null; then
              echo "✅ App healthy on 8081"
              exit 0
            fi
            echo "Waiting for app on 8081... ($i/45)"
            sleep 4
          done
          echo "❌ App did not become healthy on 8081 in time"; exit 1
        '''
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

