/**
 * Test runner. Registers a resolve hook so Node can follow Vite-style
 * extensionless imports, then runs the engine tests.
 *
 * No build step and no dependencies — `npm test` works on a fresh clone with
 * nothing but `npm install` (and in fact needs no dev dependency at all).
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./resolve-hook.mjs', pathToFileURL('./scripts/'));

await import('./test-engine.mjs');
