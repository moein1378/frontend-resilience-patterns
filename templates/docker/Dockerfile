# Replace build commands with the project service commands.
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --from=build --chown=node:node /app/dist ./dist
CMD ["node", "dist/server.js"]
