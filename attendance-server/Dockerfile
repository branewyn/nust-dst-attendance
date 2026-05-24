FROM denoland/deno:alpine

WORKDIR /app

COPY . .

# Cache all dependencies from the import map
RUN deno cache src/main.ts

# @std/dotenv/load expects a .env file to exist.
# Env vars are injected by Docker; this empty file prevents a NotFound error.
RUN touch .env

EXPOSE 3000

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "src/main.ts"]
