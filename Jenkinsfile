pipeline {
  agent any

  environment {
    DOCKERHUB_REPO = 'faiqabbasi202/ignition-insights'
    EC2_HOST = '44.222.229.138'   // ✅ current EC2 public IP
  }

  options {
    disableConcurrentBuilds()
    timestamps()
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
        sh """
          docker build -t ${DOCKERHUB_REPO}:latest -t ${DOCKERHUB_REPO}:${IMAGE_TAG} .
        """
      }
    }

    stage('Docker Push') {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'dockerhub-creds',
            usernameVariable: 'DH_USER',
            passwordVariable: 'DH_PASS'
          )
        ]) {
          sh """
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            docker push ${DOCKERHUB_REPO}:latest
            docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}
          """
        }
      }
    }

    stage('Deploy to EC2') {
      steps {
        withCredentials([
          sshUserPrivateKey(
            credentialsId: 'ec2-ssh-key',
            keyFileVariable: 'KEYFILE',
            usernameVariable: 'USER'
          )
        ]) {
          sh """
            ssh -o StrictHostKeyChecking=no -i "$KEYFILE" $USER@${EC2_HOST} '
              cd ~/assignment2/Ignition-Insights &&
              docker compose pull &&
              docker compose up -d
            '
          """
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deployment completed successfully on ${EC2_HOST}"
    }
    failure {
      echo "❌ Deployment failed! Check Jenkins logs."
    }
  }
}

