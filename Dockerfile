# ======================
# STAGE 1: BUILD
# ======================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# ======================
# STAGE 2: RUNTIME
# ======================
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev \
 && addgroup -S nodejs \
 && adduser -S nodejs -G nodejs

COPY --from=builder /app/dist ./dist

USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]