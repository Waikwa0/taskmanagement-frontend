# Stage 1: Build React app
FROM node:18 AS build

WORKDIR /app

# Copy task-frontend from within frontend folder
COPY ./task-frontend ./task-frontend

# Go into task-frontend folder
WORKDIR /app/task-frontend

# Install dependencies and build
RUN npm install
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/task-frontend/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
