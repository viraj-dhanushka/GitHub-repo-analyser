# Use node image as base
FROM node:16.16.0

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# RUN npm run build

# Expose the port your app runs on
# EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
