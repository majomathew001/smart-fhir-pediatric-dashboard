import { serve } from "bun";
import index from "./index.html";
import { getDemoFhirData } from "./api/demoFhirData";

const FHIR_BASE_URL = process.env.FHIR_BASE_URL?.replace(/\/$/, "");
const BEARER_TOKEN = process.env.BEARER_TOKEN;

function demoResponse(path: string): Response {
  const data = getDemoFhirData(path);
  return Response.json(data, {
    headers: { "X-Demo-Mode": "true" },
  });
}

async function proxyFhir(req: Request & { params: Record<string, string> }): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/fhir\/?/, "");
  const fhirPath = `${path}${url.search}`;

  if (!FHIR_BASE_URL || !BEARER_TOKEN) {
    return demoResponse(fhirPath);
  }

  const targetUrl = `${FHIR_BASE_URL}${path ? `/${path}` : ""}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${BEARER_TOKEN}`);
  headers.delete("host");
  headers.delete("accept-encoding");

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
    });

    if (response.status >= 500) {
      return demoResponse(fhirPath);
    }

    if (!response.ok) {
      const body = await response.arrayBuffer();
      return new Response(body, { status: response.status, statusText: response.statusText });
    }

    const body = await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return demoResponse(fhirPath);
  }
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
