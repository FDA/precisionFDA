# syntax=docker.io/docker/dockerfile:1

FROM node:22.15.0-alpine AS base
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.10.0  # Install pnpm globally so it's available in all stages

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* source.config.ts ./
RUN pnpm install --frozen-lockfile --prefer-offline

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./.next/standalone
COPY --from=builder /app/package.json ./

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 4040
ENV PORT=4040

# Start Next.js in production mode
CMD ["pnpm", "start"]