FROM node:18

WORKDIR /app

# Install Expo CLI and ngrok globally
RUN npm install -g expo-cli @expo/ngrok

# Copy app files
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 19000 19001 19002

CMD ["npm", "start"]
