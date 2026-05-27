import { serve } from "bun";
import index from "./index.html";

const FHIR_BASE_URL = process.env.FHIR_BASE_URL?.replace(/\/$/, "");
const BEARER_TOKEN = process.env.BEARER_TOKEN;

async function proxyFhir(req: Request & { params: Record<string, string> }): Promise<Response> {
  if (!FHIR_BASE_URL || !BEARER_TOKEN) {
    return Response.json(
      { error: "FHIR_BASE_URL and BEARER_TOKEN must be set" },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/fhir\/?/, "");
  const targetUrl = `${FHIR_BASE_URL}${path ? `/${path}` : ""}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${BEARER_TOKEN}`);
  headers.delete("host");
  headers.delete("accept-encoding");

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
  });

  const body = await response.arrayBuffer();
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

const server = serve({
  routes: {
    "/fhir/*": proxyFhir,
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
