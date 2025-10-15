#!/bin/bash

# Smart Education System Deployment Script
# This script helps you deploy your application to various platforms

echo "🚀 Smart Education System Deployment Script"
echo "============================================="

# Function to display menu
show_menu() {
    echo ""
    echo "Select deployment option:"
    echo "1) Docker (Local)"
    echo "2) Docker (Production Build)"
    echo "3) Vercel"
    echo "4) Netlify"
    echo "5) Build Only"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice [1-6]: " choice
}

# Function to build production
build_production() {
    echo "📦 Building production version..."
    npm run build:prod
    if [ $? -eq 0 ]; then
        echo "✅ Production build completed successfully!"
        echo "📁 Built files are in: dist/demo/browser/"
    else
        echo "❌ Build failed!"
        exit 1
    fi
}

# Function to deploy with Docker
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    docker-compose up -d
    if [ $? -eq 0 ]; then
        echo "✅ Docker deployment completed!"
        echo "🌐 Frontend: http://localhost:80"
        echo "🔧 Backend: http://localhost:4000"
        echo "🗄️  MongoDB: localhost:27017"
    else
        echo "❌ Docker deployment failed!"
        exit 1
    fi
}

# Function to deploy with Docker (production build)
deploy_docker_prod() {
    echo "🐳 Building and deploying with Docker..."
    docker-compose up -d --build
    if [ $? -eq 0 ]; then
        echo "✅ Docker production deployment completed!"
        echo "🌐 Frontend: http://localhost:80"
        echo "🔧 Backend: http://localhost:4000"
        echo "🗄️  MongoDB: localhost:27017"
    else
        echo "❌ Docker production deployment failed!"
        exit 1
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "⚡ Deploying to Vercel..."
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    build_production
    vercel --prod
    if [ $? -eq 0 ]; then
        echo "✅ Vercel deployment completed!"
    else
        echo "❌ Vercel deployment failed!"
        exit 1
    fi
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "🌐 Deploying to Netlify..."
    if ! command -v netlify &> /dev/null; then
        echo "❌ Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    build_production
    netlify deploy --prod --dir=dist/demo/browser
    if [ $? -eq 0 ]; then
        echo "✅ Netlify deployment completed!"
    else
        echo "❌ Netlify deployment failed!"
        exit 1
    fi
}

# Main script logic
while true; do
    show_menu
    case $choice in
        1)
            deploy_docker
            ;;
        2)
            deploy_docker_prod
            ;;
        3)
            deploy_vercel
            ;;
        4)
            deploy_netlify
            ;;
        5)
            build_production
            ;;
        6)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
