#!/usr/bin/env bash
set -euo pipefail
cd ~/assignment2/Ignition-Insights

# temp override with DB URL (does not modify your repo files)
cat > /tmp/compose.cicd.override.yml <<'YAML'
services:
  a2-app:
    environment:
      MONGO_URL: mongodb://a2-mongo:27017/ignition
      MONGODB_URI: mongodb://a2-mongo:27017/ignition
YAML

# pull latest image and restart app only, with override
docker pull faiqabbasi202/ignition-insights:latest
docker compose -f docker-compose.yml -f /tmp/compose.cicd.override.yml up -d a2-app --remove-orphans
docker compose ps
