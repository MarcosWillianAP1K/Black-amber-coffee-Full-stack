
# DockerFile for Black Amber Coffee API, this file is used to build the Docker image for the API, it uses a multi-stage build to optimize the final image size from 1.4GB to 100MB. The first stage is the builder stage, where we install the dependencies and build the application. The second stage is the runtime stage, where we copy the built application and install only the production dependencies.

FROM node:18-alpine3.18 AS builder
WORKDIR /app
COPY package*.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine3.18 AS runtime
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=builder /app/dist ./dist
COPY package.json  package-lock.json ./
RUN npm ci --omit-dev


ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl --fail http://localhost:8000/api/health || exit 1

CMD ["node", "dist/server.js"]

