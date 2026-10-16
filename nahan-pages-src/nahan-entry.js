import nahan from "./_worker.encode.js";

// Preserve older subscription links when Nahan has a custom API route in D1.
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Temporary deployment check: report only whether D1 and Nahan respond.
    if (request.method === "GET" && url.pathname === "/.well-known/nahan-ready") {
      try {
        if (!env.IOT_DB) return new Response(null, { status: 503 });
        const row = await env.IOT_DB.prepare(
          "SELECT value FROM kv_store WHERE key = 'sys_config'",
        ).first();
        if (!row?.value) return new Response(null, { status: 503 });
        const route = JSON.parse(row.value)?.apiRoute || "sync";
        url.pathname = `/${encodeURI(route)}`;
        const sub = await nahan.fetch(new Request(url, request), env, ctx);
        const body = await sub.text();
        return new Response(null, {
          status: sub.ok && body.length > 100 ? 204 : 503,
        });
      } catch {
        return new Response(null, { status: 503 });
      }
    }
    if (request.method === "GET" && /^\/sync\/sub\/?$/.test(url.pathname)) {
      let apiRoute = "sync";
      try {
        const row = await env.IOT_DB?.prepare(
          "SELECT value FROM kv_store WHERE key = 'sys_config'",
        ).first();
        const configuredRoute = JSON.parse(row?.value || "null")?.apiRoute;
        if (typeof configuredRoute === "string" && configuredRoute.trim()) {
          apiRoute = configuredRoute.trim();
        }
      } catch {
        // A new database uses Nahan's default route.
      }
      url.pathname = `/${encodeURI(apiRoute)}`;
      return nahan.fetch(new Request(url, request), env, ctx);
    }
    return nahan.fetch(request, env, ctx);
  },
  scheduled(controller, env, ctx) {
    return nahan.scheduled?.(controller, env, ctx);
  },
};
