# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS dependencies

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci


FROM node:22-bookworm-slim AS development

WORKDIR /workspace

COPY --from=dependencies /workspace/node_modules ./node_modules
COPY --from=dependencies /workspace/package-lock.json /opt/linkport-dependencies/package-lock.json
COPY --from=dependencies /workspace/node_modules /opt/linkport-dependencies/node_modules
COPY --chown=node:node . .
COPY --chmod=755 docker/development-entrypoint.sh /usr/local/bin/linkport-development-entrypoint

RUN chown -R node:node /workspace /opt/linkport-dependencies

USER node

EXPOSE 5173

ENTRYPOINT ["/usr/local/bin/linkport-development-entrypoint"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


FROM dependencies AS build

COPY . .
RUN npm run build


FROM nginxinc/nginx-unprivileged:alpine AS production

COPY --chown=101:101 docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=101:101 --from=build /workspace/dist /usr/share/nginx/html
COPY --chown=101:101 --chmod=755 docker/production-entrypoint.sh /docker-entrypoint.d/40-linkport-runtime-config.sh

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
