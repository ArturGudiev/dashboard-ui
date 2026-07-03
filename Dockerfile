# Stage 1: Build the Angular app
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies for the build)
RUN npm install --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve the app
FROM nginx:alpine
RUN apk add --no-cache apache2-utils

# Copy built assets from build stage
# Angular application builder outputs to dist/dashboard-ui/browser
COPY --from=build /app/dist/dashboard-ui/browser /usr/share/nginx/html

# Copy custom nginx config (optional: SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Entrypoint writes env.js from API_HOST/API_PORT at runtime, then starts nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
