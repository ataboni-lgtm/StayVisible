# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:22 AS base

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apt-get update

# Install codex CLI globally (as root so it lands in /usr/local/bin, accessible to all users)
RUN npm install -g @openai/codex

# Install dependencies as the node user so mounted volumes inherit the right owner.
COPY --chown=node:node package.json package-lock.json ./
RUN chown node:node /app
USER node

RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY --chown=node:node . .
    
# Disable telematry:
RUN npx next telemetry disable


CMD ["sh", "-c", "npm run migrate && npm run start"]