export default {
  async fetch() {
    return new Response("Hello from Pages Functions!", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
