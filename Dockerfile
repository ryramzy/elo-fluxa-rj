# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build-time args for Vite env vars ----
# These are injected via --build-arg from Cloud Build + Secret Manager.
# Placed AFTER npm ci to maximise Docker layer cache (deps don't
# change when env values change).
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_GOOGLE_CLIENT_ID

# Expose ARGs as ENVs so Vite's import.meta.env picks them up
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy all source files and build
COPY . .
RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run requires port 8080
EXPOSE 8080

# Run nginx in foreground (required for containers)
CMD ["nginx", "-g", "daemon off;"]
