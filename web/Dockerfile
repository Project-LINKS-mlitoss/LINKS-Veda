# Base stage with shared environment settings
FROM node:lts AS base
RUN apt-get update -y
RUN apt-get install -y openssl
WORKDIR /app

# Install necessary system dependencies
RUN npm install -g bun

# Copy package management files and install dependencies
COPY package.json bun.lockb bunfig.toml ./
RUN bun install

# Copy the rest of the application code
COPY . .

# Development stage
FROM base AS development
CMD ["bun", "run", "dev"]

# Build stage for production, remove development dependencies and reinstall only production dependencies
FROM base AS build-stage
RUN bun prisma generate && \
    bun run build && \
    rm -rf node_modules && \
    bun install --production && \
    bun prisma generate

# Production stage, use a lighter base image if available
FROM node:lts-slim AS production
WORKDIR /app

RUN apt-get update -qq && \
    apt-get install -y openssl

# Copy built files and necessary production node_modules from the build stage
COPY --from=build-stage /app/build /app/build
COPY --from=build-stage /app/package.json /app/package.json
COPY --from=build-stage /app/node_modules /app/node_modules
COPY --from=build-stage /app/prisma /app/prisma

# Command to run the application in production
CMD ["npm", "run", "start"]
