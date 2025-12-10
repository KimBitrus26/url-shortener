# Stage 1: Dependencies 
FROM node:18 AS builder
WORKDIR /app

# Copy 
COPY . .

# install dependencies
RUN npm ci

FROM node:18-slim

WORKDIR /app

# Copy from builder
COPY --from=builder /app ./

# Make script executable
RUN chmod 755 /app/run_script.sh

# Expose API port
EXPOSE 5000

ENV NODE_ENV=production

CMD ["sh", "/app/run_script.sh"]
