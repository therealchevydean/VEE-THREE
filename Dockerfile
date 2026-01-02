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

# COPY backend package files
COPY backend/package*.json ./
RUN npm install

# COPY backend source
COPY backend ./
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine

WORKDIR /app

# Copy built frontend to public directory (backend will serve it)
COPY --from=frontend-builder /app/dist /app/public

# COPY backend with dependencies
COPY --from=backend-builder /app/backend /app/backend

# Expose port
EXPOSE 8080

# Start backend only (it serves both API and frontend)
CMD ["sh", "-c", "cd /app/backend && npm start"]
