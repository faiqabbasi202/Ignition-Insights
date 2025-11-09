# ---------- Stage 1: Install deps & build frontend ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copy package manifests first for better caching
COPY package*.json ./

# Install full deps (includes dev for Vite build)
# If you use npm workspaces or lockfile, add it here as well.
RUN npm ci

# Copy the rest of the source
COPY . .

# Build the frontend (Vite → /app/dist)
RUN npm run build

# ----


# ---------- Stage 2: Production runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# Install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend + built frontend (from build stage)
COPY server.js ./server.js
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Add curl for healthcheck
RUN apk add --no-cache curl

# Healthcheck (root path)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:${PORT}/ || exit 1

CMD ["node", "server.js"]
