FROM node:18

# Set working directory
WORKDIR /map

# Copy package.json and package-lock.json
COPY package*.json ./


# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port specified in the .env file
EXPOSE 3004

# Define the command to run the application
CMD ["node", "server.js"]