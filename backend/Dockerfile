FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Env & ports
ENV PORT=4000
EXPOSE 4000

CMD ["npm", "start"]
