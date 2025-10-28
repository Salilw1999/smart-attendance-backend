#!/bin/sh
set -e

# Set default values for environment variables
export BACKEND_HOST=${BACKEND_HOST:-localhost}
export BACKEND_PORT=${BACKEND_PORT:-8000}
export API_PROTOCOL=${API_PROTOCOL:-http}
export API_PREFIX=${API_PREFIX:-/api}

echo "🔧 Generating nginx.conf with runtime environment variables..."
envsubst '${BACKEND_HOST} ${BACKEND_PORT} ${API_PROTOCOL} ${API_PREFIX}' \
  < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "� Generating config.js with runtime environment variables..."
envsubst '${API_PROTOCOL} ${API_HOST} ${API_PORT} ${API_PREFIX}' \
  < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js || true

echo "�🚀 Starting Nginx..."
nginx -t  # optional: test config before running
nginx -g 'daemon off;'



