FROM node:16
# Create app directory
WORKDIR /
COPY package*.json ./
# For development
RUN npm install
# FOR production
# RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD [ "node", "./app" ]