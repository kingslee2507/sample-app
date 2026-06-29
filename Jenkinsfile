pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = "610981310163"
        AWS_REGION     = "us-east-1"
        IMAGE_NAME     = "sample-app"
        ECR_REPO       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}"
        CLUSTER_NAME   = "my-cluster"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ./app
                '''
            }
        }

        stage('Login to Amazon ECR') {
    steps {
        withCredentials([[
            $class: 'AmazonWebServicesCredentialsBinding',
            credentialsId: 'aws-credentials'
        ]]) {
            sh '''
                aws sts get-caller-identity

                aws ecr get-login-password --region us-east-1 | \
                docker login \
                --username AWS \
                --password-stdin 610981310163.dkr.ecr.us-east-1.amazonaws.com
            '''
        }
    }
}

        stage('Tag Image') {
            steps {
                sh '''
                docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${ECR_REPO}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Push Image') {
            steps {
                sh '''
                docker push ${ECR_REPO}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Update kubeconfig') {
    steps {
        withCredentials([[
            $class: 'AmazonWebServicesCredentialsBinding',
            credentialsId: 'aws-credentials'
        ]]) {
            sh '''
                aws eks update-kubeconfig \
                --region ${AWS_REGION} \
                --name ${CLUSTER_NAME}
            '''
        }
    }
}

       stage('Deploy to EKS') {
    steps {
        withCredentials([[
            $class: 'AmazonWebServicesCredentialsBinding',
            credentialsId: 'aws-creds'
        ]]) {
            sh '''
                aws eks update-kubeconfig \
                  --region ${AWS_REGION} \
                  --name ${CLUSTER_NAME}

                sed -i "s|IMAGE_PLACEHOLDER|${ECR_REPO}:${BUILD_NUMBER}|g" kubernetes/deployment.yaml

                kubectl apply -f kubernetes/

                kubectl rollout status deployment/sample-app
            '''
        }
    }
}

    post {

        success {
            echo "Deployment Successful"
        }

        failure {
            echo "Deployment Failed"
        }

    }
}
