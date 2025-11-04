#!/bin/sh
set -e

# ----------------------------
# 1️⃣ Load environment variables from .env
# ----------------------------
if [ -f ".env" ]; then
  echo "📦 Loading environment variables from .env"
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️  No .env file found in current directory. Using defaults."
fi

# ----------------------------
# 2️⃣ Default values if not provided
# ----------------------------
: "${BACKEND_HOST:=backend}"
: "${BACKEND_PORT:=8000}"
: "${API_PROTOCOL:=http}"
: "${API_HOST:=$BACKEND_HOST}"
: "${API_PORT:=$BACKEND_PORT}"
: "${API_PREFIX:=/api}"

# ----------------------------
# 3️⃣ Generate nginx.conf from template
# ----------------------------
echo "🔧 Generating nginx.conf..."
envsubst '${BACKEND_HOST} ${BACKEND_PORT}' \
  < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# ----------------------------
# 4️⃣ Generate config.js for frontend runtime
# ----------------------------
echo "🧩 Generating runtime config.js..."
envsubst '${API_PROTOCOL} ${API_HOST} ${API_PORT} ${API_PREFIX}' \
  < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js

# ----------------------------
# 5️⃣ Start Nginx
# ----------------------------
echo "✅ Starting Nginx with environment:"
echo "   BACKEND_HOST=$BACKEND_HOST"
echo "   BACKEND_PORT=$BACKEND_PORT"
echo "   API_PROTOCOL=$API_PROTOCOL"
echo "   API_HOST=$API_HOST"
echo "   API_PORT=$API_PORT"
echo "   API_PREFIX=$API_PREFIX"

nginx -t
exec nginx -g 'daemon off;'
