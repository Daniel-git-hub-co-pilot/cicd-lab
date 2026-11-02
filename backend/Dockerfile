
# Use Node.js 24 Alpine as the base image
FROM node:24-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source files
COPY server.js db.js ./

# Application listens on port 3000
EXPOSE 3000

# Start the backend
CMD ["npm", "start"]
