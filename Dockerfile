# Multi-stage build for Angular + Node.js application

# Stage 1: Build Angular application
FROM node:18-alpine AS angular-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .

# Stage 3: Production image
FROM node:18-alpine AS production
WORKDIR /app

# Install serve for static files
RUN npm install -g serve

# Copy built Angular app
COPY --from=angular-build /app/dist/demo/browser ./public

# Copy backend
COPY --from=backend-build /app ./backend

# Create environment file
RUN echo "PORT=4000" > .env && \
    echo "MONGODB_URI=mongodb://mongo:27017/education" >> .env

# Expose ports
EXPOSE 4000 80

# Create startup script
RUN echo '#!/bin/sh\n\
cd /app/backend && npm start &\n\
cd /app && serve -s public -l 80\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
