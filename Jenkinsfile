// Jenkinsfile (Declarative Pipeline - Adaptado para Windows con PowerShell)

pipeline {
    agent any // O un agente Windows específico

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_USERNAME = 'marckos202' // CAMBIAME
        // KUBECONFIG puede ser necesario si kubectl no encuentra la config automáticamente
        // KUBECONFIG = "C:/Users/JenkinsUser/.kube/config" // Ejemplo de ruta en Windows
        APP_VERSION = "latest"
        BACKEND_IMAGE_NAME = "\$env:DOCKERHUB_USERNAME/mern-backend" // Usar \$env para PowerShell
        FRONTEND_IMAGE_NAME = "\$env:DOCKERHUB_USERNAME/mern-frontend"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo "Código fuente extraído."
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
            powershell 'Write-Host "Usuario Docker Hub (desde Jenkins) para el login: $env:DOCKERHUB_USER"'
            powershell 'Write-Host "Usuario Docker Hub (desde Jenkins) para el login: $env:DOCKERHUB_PASSWORD.Length"'
  
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

        stage('Update Kubernetes Manifests') {
            steps {
                script {
                    def backendDeploymentPath = "${env.K8S_FILES_PATH}/backend-deployment.yaml"
                    def frontendDeploymentPath = "${env.K8S_FILES_PATH}/frontend-deployment.yaml"

                    // Actualizar backend-deployment.yaml
                    powershell """
                    (Get-Content -Path '${backendDeploymentPath}' -Raw) `
                      -replace 'image: mern-backend:latest', 'image: ${env.BACKEND_IMAGE_NAME}:${env.APP_VERSION}' `
                      -replace 'imagePullPolicy: Never', 'imagePullPolicy: Always' |
                    Set-Content -Path '${backendDeploymentPath}'
                    """

                    // Actualizar frontend-deployment.yaml
                    powershell """
                    (Get-Content -Path '${frontendDeploymentPath}' -Raw) `
                      -replace 'image: mern-frontend:latest', 'image: ${env.FRONTEND_IMAGE_NAME}:${env.APP_VERSION}' `
                      -replace 'imagePullPolicy: Never', 'imagePullPolicy: Always' |
                    Set-Content -Path '${frontendDeploymentPath}'
                    """
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {
                script {
                    powershell "kubectl apply -f mongo-deployment.yaml"
                    powershell "kubectl apply -f mongo-service.yaml"
                    powershell "kubectl apply -f backend-deployment.yaml"
                    powershell "kubectl apply -f backend-service.yaml"
                    powershell "kubectl apply -f frontend-deployment.yaml"
                    powershell "kubectl apply -f frontend-service.yaml"
                    powershell "kubectl apply -f ingress.yaml"

                    powershell "echo 'Esperando a que los despliegues estén listos...'"
                    powershell "kubectl rollout status deployment/mongo-deployment --timeout=180s"
                    powershell "kubectl rollout status deployment/backend-deployment --timeout=180s"
                    powershell "kubectl rollout status deployment/frontend-deployment --timeout=180s"
                    powershell "echo 'Despliegues completados (o timeout).'"
                }
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