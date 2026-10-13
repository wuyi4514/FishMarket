import { buildApp } from "./http.js";

const port = Number.parseInt(process.env.PORT ?? "8080", 10);
const app = buildApp();

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
