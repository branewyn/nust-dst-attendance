import "jsr:@std/dotenv/load";
import { config } from "./config.ts";
import { createApp } from "./app.ts";

const app = createApp();

console.log(`🚀 Server running on http://localhost:${config.port}`);
await app.listen({ port: config.port });
