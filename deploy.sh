#!/bin/bash

# Backend Build
echo "Construindo Backend Spring Boot..."
cd backend
./mvnw clean package -Pproduction
docker build -t blog-backend .

# Frontend Build
echo "Construindo Frontend Next.js..."
cd ../frontend
npm run build

# Deploy (exemplo genérico, adapte conforme sua infraestrutura)
echo "Iniciando deploy..."
docker push blog-backend
# Comandos específicos do seu provedor de nuvem
