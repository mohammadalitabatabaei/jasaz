# Nahan Pages fallback

`pages-fallback/_worker.js` is a bundled Pages Function built from
`nahan-entry.js` and `_worker.encode.js` in this directory. The Nahan source
comes from `itsyebekhe/nahan` commit
`67c9a038da4b0812bc4c8b630a6144967d102880`.

To rebuild the Pages Function:

```sh
npx esbuild nahan-pages-src/nahan-entry.js --bundle --format=esm \
  --platform=neutral --external:cloudflare:sockets \
  --outfile=pages-fallback/_worker.js
```

The existing Pages workflow deploys the bundled file. In Cloudflare Pages
project settings, bind the existing `nahan-db` D1 database as `IOT_DB` for
Production before running the deployment.
