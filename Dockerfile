# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and data
COPY . .

# Build the project
RUN npm run build

# Runtime stage
FROM node:20-slim AS runner

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Expose the port (MCP server uses 3001 in our index.ts)
EXPOSE 3001

# Set the environment variable for the port if needed
ENV PORT=3001

# Start the server
CMD ["npm", "start"]
