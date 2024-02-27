FROM oven/bun:1

WORKDIR /app

COPY apps/websocket/build/index.js .

EXPOSE 3001/tcp
CMD ["bun", "run", "index.js"]