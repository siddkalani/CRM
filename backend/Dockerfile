# backend/Dockerfile
FROM node:18

WORKDIR /app

# Install deps first to leverage caching
COPY package*.json ./
RUN npm install --production

# Copy rest of the code
COPY . .

# Expose port used by the app
EXPOSE 3002

# Run the server
CMD ["node", "server.js"]
