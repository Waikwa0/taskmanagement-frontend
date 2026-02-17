# Stage 1: Build React app
FROM node:18 AS build

WORKDIR /app

# Copy task-frontend folder from context (relative to repo root)
COPY ./frontend/task-frontend ./task-frontend

WORKDIR /app/task-frontend

RUN npm install
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/task-frontend/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
