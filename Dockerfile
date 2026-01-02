# Multi-stage build for VEE (Virtual Ecosystem Engineer) with Backend
# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
RUN npm install

# Copy source and build frontend
COPY . .
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
RUN npm install

# Copy backend source
COPY backend ./

# Stage 3: Production runtime
FROM node:20-alpine

WORKDIR /app

# Install serve for frontend static files
RUN npm install -g serve

# Copy built frontend
COPY --from=frontend-builder /app/dist /app/frontend/dist

# Copy backend with dependencies
COPY --from=backend-builder /app/backend /app/backend

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'serve -s /app/frontend/dist -l 8080 &' >> /app/start.sh && \
    echo 'cd /app/backend && npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 8080

# Start both services
CMD ["/app/start.sh"]
