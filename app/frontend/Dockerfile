# Use Node.js 22 Alpine Linux image as base
FROM docker.io/node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package manifests
COPY package*.json ./

# Install frontend dependencies inside the container
RUN npm install

# Copy frontend source code
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Start Vite dev server bound to 0.0.0.0 so host browser can reach it
CMD ["npm", "run", "dev"]

