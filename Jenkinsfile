pipeline {
  agent any

  environment {
    DOCKERHUB_REPO = 'faiqabbasi202/ignition-insights'
    EC2_HOST       = '44.222.229.138'      // update if your public IP changes
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
        script {
          env.IMAGE_TAG = sh(
            script: 'git rev-parse --short HEAD',
            returnStdout: true
          ).trim()
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh '''
          docker build -t ${DOCKERHUB_REPO}:latest -t ${DOCKERHUB_REPO}:${IMAGE_TAG} .
        '''
      }
    }

    stage('Docker Push') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DH_USER',
          passwordVariable: 'DH_PASS'
        )]) {
          sh '''
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            docker push ${DOCKERHUB_REPO}:latest
            docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}
          '''
        }
      }
    }

    stage('Deploy Part-2 on EC2') {
      steps {
        withCredentials([sshUserPrivateKey(
          credentialsId: 'ec2-ssh',
          keyFileVariable: 'KEYFILE',
          usernameVariable: 'USER'
        )]) {
          sh """
            ssh -o StrictHostKeyChecking=no -i "$KEYFILE" $USER@${EC2_HOST} '
              set -e
              cd ~/assignment2/Ignition-Insights &&
              docker compose -f docker-compose.ci.yml pull &&
              docker compose -f docker-compose.ci.yml up -d
            '
          """
        }
      }
    }

    stage('Wait for Health (8081)') {
      steps {
        sh '''
          for i in $(seq 1 30); do
            if curl -fsSI "http://${EC2_HOST}:8081/" >/dev/null; then
              echo "App healthy on 8081"
              exit 0
            fi
            echo "Waiting for app on 8081... ($i/30)"
            sleep 4
          done
          echo "App did not become healthy on 8081 in time"; exit 1
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

