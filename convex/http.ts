import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [
      process.env.SITE_URL ?? "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
    ],
    allowedHeaders: ["Content-Type", "Authorization", "Better-Auth-Cookie"],
  },
});

export default http;
