# ---------- Build Stage ----------
FROM node:18-slim AS build

# Set working directory
WORKDIR /app

# Copy only package files for caching
COPY package*.json ./

# Install dependencies
RUN npm install --force --slient

# Copy all frontend source files
COPY . ./

# Build optimized production files
RUN npm run build

# ---------- Run Stage ----------
FROM nginx:alpine

# Copy build output to nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
