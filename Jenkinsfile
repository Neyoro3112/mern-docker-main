pipeline {
    agent any 

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_USERNAME = 'marckos202'
        APP_VERSION = "latest"
        BACKEND_IMAGE_NAME = "\$env:DOCKERHUB_USERNAME/mern-backend"
        FRONTEND_IMAGE_NAME = "\$env:DOCKERHUB_USERNAME/mern-frontend"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo "Código fuente extraído."
            }
        }
        
        stage('Run test Backend') {
            steps {
                dir('backend') {
                    script {
                     powershell 'Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npm install' 
                     powershell 'Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npm test'
                    }
                }
            }
        }
        
        stage('Run test Frontend') {
            steps {
                dir ('client') {
                    script {
                     powershell 'Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npm install'    
                     powershell 'Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npm test'
                    }
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                    powershell "docker build -t ${env.BACKEND_IMAGE_NAME}:${env.APP_VERSION} -f Dockerfile-backend ."
            }
        }

        stage('Build Frontend Image') {
            steps {
                    powershell "docker build -t ${env.FRONTEND_IMAGE_NAME}:${env.APP_VERSION} -f Dockerfile-frontend ."
            }
        }

        stage('Login to Docker Hub') {
    steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, passwordVariable: 'DOCKERHUB_PASSWORD', usernameVariable: 'DOCKERHUB_USER')]) {
            powershell 'docker login -u $env:DOCKERHUB_USER -p $env:DOCKERHUB_PASSWORD'
        }
    }
}

        stage('Push Backend Image') {
            steps {
                powershell "docker push \"${env.BACKEND_IMAGE_NAME}:${env.APP_VERSION}\""
            }
        }

        stage('Push Frontend Image') {
            steps {
                powershell "docker push \"${env.FRONTEND_IMAGE_NAME}:${env.APP_VERSION}\""
            }
        }


        stage('Deploy to Minikube') {
            steps {
                    powershell "kubectl apply -f mongo-deployment.yaml --validate=false"
                    powershell "kubectl apply -f mongo-service.yaml --validate=false"
                    powershell "kubectl apply -f backend-deployment.yaml --validate=false"
                    powershell "kubectl apply -f backend-service.yaml --validate=false"
                    powershell "kubectl apply -f frontend-deployment.yaml --validate=false"
                    powershell "kubectl apply -f frontend-service.yaml --validate=false"
                    powershell "kubectl apply -f ingress.yaml --validate=false"

                    powershell "echo 'Esperando a que los despliegues estén listos...'"
                    powershell "kubectl rollout status deployment/mongo-deployment --timeout=180s"
                    powershell "kubectl rollout status deployment/backend-deployment --timeout=180s"
                    powershell "kubectl rollout status deployment/frontend-deployment --timeout=180s"
                    powershell "echo 'Despliegues completados (o timeout).'"
            }
        }
    }

    post {
        always {
            script {
                powershell 'docker logout'
            }
            echo 'Pipeline finalizado.'
        }
    }
}