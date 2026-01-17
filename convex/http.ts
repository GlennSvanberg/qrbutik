import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { isDevMagicLinkEnabled } from "./devMagicLink";
import { api, internal } from "./_generated/api";

const http = httpRouter();

const allowedOrigins = new Set([
  process.env.SITE_URL ?? "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
]);

const withCors = (req: Request, response: Response): Response => {
  const origin = req.headers.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  return response;
};

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: Array.from(allowedOrigins),
    allowedHeaders: ["Content-Type", "Authorization", "Better-Auth-Cookie"],
  },
});

http.route({
  path: "/dev/magic-link",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    if (!isDevMagicLinkEnabled()) {
      return withCors(req, new Response("Not Found", { status: 404 }));
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return withCors(req, new Response("Missing email", { status: 400 }));
    }

    const result = await ctx.runQuery(api.devMagicLink.getDevMagicLink, {
      email,
    });

    if (!result) {
      return withCors(req, new Response(null, { status: 204 }));
    }

    return withCors(
      req,
      new Response(JSON.stringify({ url: result.url }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }),
});

http.route({
  path: "/dev/magic-link",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (!isDevMagicLinkEnabled()) {
      return withCors(req, new Response("Not Found", { status: 404 }));
    }

    let payload: { email?: string; url?: string } | null = null;
    const rawBody = await req.text();
    if (rawBody) {
      try {
        payload = JSON.parse(rawBody) as { email?: string; url?: string };
      } catch {
        payload = null;
      }
    }

    const { searchParams } = new URL(req.url);
    const email = payload?.email ?? searchParams.get("email");
    const url = payload?.url ?? searchParams.get("url");

    if (!email || !url) {
      return withCors(req, new Response("Missing payload", { status: 400 }));
    }

    await ctx.runMutation(internal.devMagicLink.storeDevMagicLink, {
      email,
      url,
    });

    return withCors(req, new Response(null, { status: 204 }));
  }),
});

export default http;
