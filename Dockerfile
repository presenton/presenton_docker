FROM python:3.11-slim-bookworm

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    nodejs \  
    npm
  
# Create a working directory
WORKDIR /app  

# Install dependencies for FastAPI
COPY servers/fastapi/requirements.txt ./
RUN pip install -r requirements.txt


# Install dependencies for Next.js
WORKDIR /app/servers/nextjs
COPY servers/nextjs/package.json servers/nextjs/package-lock.json ./
RUN npm install

# Install chrome for puppeteer
RUN npx puppeteer browsers install chrome --install-deps

WORKDIR /app

# Copy Next.js app
COPY servers/nextjs/ ./servers/nextjs/

# Build the Next.js app with environment variables
WORKDIR /app/servers/nextjs
ARG FASTAPI_URL=http://0.0.0.0:8000
ENV NEXT_PUBLIC_FAST_API=${FASTAPI_URL}
RUN npm run build

WORKDIR /app

# Copy FastAPI and start script
COPY servers/fastapi/ ./servers/fastapi/
COPY start.js LICENSE NOTICE ./

ENV APP_DATA_DIRECTORY=/app/user_data
ENV TEMP_DIRECTORY=/tmp/presenton



# Expose the ports for Next.js and FastAPI
EXPOSE 3000 8000

# Start the servers
CMD ["node", "start.js"]