pipeline {
    agent any 

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_USERNAME = 'pipe3112'
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
                    powershell '''
                    minikube start
                    kubectl config use-context minikube

                    Write-Host "⏳ Verificando conexión a Minikube..."
                    kubectl cluster-info
                    if ($LASTEXITCODE -ne 0) {
                        Write-Error "❌ Minikube no está disponible. Aborting..."
                        exit 1
                    }

                    Write-Host "🚀 Aplicando manifiestos Kubernetes..."
                    kubectl apply -f mongo-deployment.yaml --validate=false
                    kubectl apply -f mongo-service.yaml --validate=false
                    kubectl apply -f backend-deployment.yaml --validate=false
                    kubectl apply -f backend-service.yaml --validate=false
                    kubectl apply -f frontend-deployment.yaml --validate=false
                    kubectl apply -f frontend-service.yaml --validate=false
                    kubectl apply -f ingress.yaml --validate=false

                    Write-Host "🕒 Esperando a que los despliegues estén listos..."
                    kubectl rollout status deployment/mongo-deployment --timeout=180s
                    kubectl rollout status deployment/backend-deployment --timeout=180s
                    kubectl rollout status deployment/frontend-deployment --timeout=180s
                    Write-Host "✅ Despliegues completados."
                    minikube service frontend-service --url
                '''
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