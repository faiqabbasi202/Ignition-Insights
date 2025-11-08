pipeline {
  agent any

  environment {
    DOCKERHUB_REPO = 'faiqabbasi202/ignition-insights'
    EC2_HOST = '107.23.188.255'   // ⚠️ replace with your CURRENT EC2 public IP if changed
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
        sshagent (credentials: ['ec2-ssh']) {
          sh """
            ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} \
            'bash ~/assignment2/Ignition-Insights/deploy.sh'
          """
        }
      }
    }

    stage('Health Check') {
      steps {
        sshagent (credentials: ['ec2-ssh']) {
          sh """
            ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} \
            'curl -sf http://127.0.0.1/'
          """
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
    success {
      echo "✅ Deployed ${DOCKERHUB_REPO}:${IMAGE_TAG} successfully!"
    }
    failure {
      echo "❌ Build or deploy failed. Check console output."
    }
  }
}
