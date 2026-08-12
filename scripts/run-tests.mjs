/**
 * Bundles the engine tests with esbuild (so Node can follow Vite-style
 * extensionless imports) and runs them.
 */
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import { rm } from 'node:fs/promises';
import path from 'node:path';

const out = path.resolve('node_modules/.cache/kidlearn-tests.mjs');

await build({
  entryPoints: ['scripts/test-engine.mjs'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: out,
  logLevel: 'error',
});

try {
  await import(pathToFileURL(out).href);
} finally {
  await rm(out, { force: true });
}
