# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and build TypeScript
COPY tsconfig.json ./
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# ==========================================
# Stage 2: Production Runtime Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for container security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 devtrack

# Install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Copy generated Prisma Client and compiled code from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=devtrack:nodejs /app/dist ./dist

# Use non-root user
USER devtrack

EXPOSE 5000

CMD ["node", "dist/server.js"]
