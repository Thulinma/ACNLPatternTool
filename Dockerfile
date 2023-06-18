FROM node:16-alpine
WORKDIR /app
COPY . .
ENV DEV_HOST=0.0.0.0
ENV DEV_PORT=3000
EXPOSE 3000
RUN npm install
CMD ["npm", "run", "dev"]