# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the frontend source
COPY task-frontend ./task-frontend

# Set working directory inside the container
WORKDIR /app/task-frontend

# Build the frontend (if using React or Angular)
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
