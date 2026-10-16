import nahan from "./_worker.encode.js";

// Preserve older subscription links when Nahan has a custom API route in D1.
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
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
