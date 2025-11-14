pipeline {
  agent any
  triggers {
    pollSCM('H/30 * * * *')
  }
  environment {
    PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
  }
  stages {
    stage('Install') {
      steps {
        sh 'echo $PATH && node -v && npm -v'
        sh 'npm ci'
        sh 'npx playwright install --with-deps'
      }
    }
    stage('Test Shards') {
      parallel {
        stage('Shard 1') {
          steps {
            sh 'npx playwright test --project=chromium --shard=1/2 --workers=50% --reporter=blob'
            sh 'mkdir -p blob-zip-1 && cp blob-report/*.zip blob-zip-1/'
            stash includes: 'blob-zip-1/**', name: 'blob-zip-1'
          }
        }
        stage('Shard 2') {
          steps {
            sh 'npx playwright test --project=chromium --shard=2/2 --workers=50% --reporter=blob'
            sh 'mkdir -p blob-zip-2 && cp blob-report/*.zip blob-zip-2/'
            stash includes: 'blob-zip-2/**', name: 'blob-zip-2'
          }
        }
      }
    }
    stage('Merge Report') {
      steps {
        sh 'mkdir -p blob-all'
        unstash 'blob-zip-1'
        unstash 'blob-zip-2'
        sh 'mv blob-zip-1/*.zip blob-all/ || true'
        sh 'mv blob-zip-2/*.zip blob-all/ || true'
        sh 'npx playwright merge-reports --reporter=html blob-all'
        archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true
      }
    }
  }
}
