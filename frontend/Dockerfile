# ---------- Build Stage ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install --force --silent

# Copy source and build production assets
COPY . ./
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:stable-alpine

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx template and entrypoint script
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Expose Nginx port
EXPOSE 80

# Use our custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]
