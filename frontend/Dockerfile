# ---------- Build Stage ----------
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --force --silent
COPY . ./
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:stable-alpine

# Copy build output
COPY --from=build /app/build /usr/share/nginx/html
# Copy nginx template + config template + entrypoint
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY config.js.template /usr/share/nginx/html/config.js.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
