FROM node:22.9.0-slim as builder
WORKDIR /app
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    yarn install
RUN --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
    --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=package.json,target=package.json \
    yarn build

FROM node:22.9.0-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.npm,sharing=locked \
    yarn install --production
COPY .env ./
CMD ["node", "dist/index.js"]
