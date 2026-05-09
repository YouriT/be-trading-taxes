FROM oven/bun:1.2 as base
WORKDIR /usr/src/app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Build the app
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build

# Final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.next .next
COPY --from=prerelease /usr/src/app/public public
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/server.ts .
COPY --from=prerelease /usr/src/app/src src

# Install playwright browsers in the final image
RUN bun x playwright install chromium --with-deps

USER bun
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "start" ]
