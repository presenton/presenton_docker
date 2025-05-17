FROM python:3.11-slim-bookworm

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    nodejs \  
    npm
  
# Copy the start script and the servers directory
WORKDIR /app  
COPY start.js LICENSE NOTICE ./
COPY servers ./servers

# Install dependencies for FastAPI
WORKDIR /app/servers/fastapi
RUN pip install -r requirements.txt

# Install dependencies for Next.js
WORKDIR /app/servers/nextjs
RUN npm install && npm run build

WORKDIR /app

# Expose the ports for Next.js and FastAPI
EXPOSE 3000 8000

# Start the servers
CMD ["node", "start.js"]