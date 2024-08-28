FROM node:20.15.1-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm i
COPY . .
RUN npm run build

FROM node:20.15.1-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json .
RUN npm i --omit=dev
COPY --from=builder /app/dist ./dist
CMD [ "npm", "run", "start" ]