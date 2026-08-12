/**
 * Node ESM resolve hook: lets Node follow Vite-style extensionless imports.
 *
 * Source files import `'./levelConfig'` (no extension) because Vite resolves
 * that. Plain Node doesn't, so the test runner needs a hook. Doing it this way
 * rather than bundling means `npm test` needs no build tool and no native
 * binary — it runs identically on Windows, macOS and Linux.
 */
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    // Only retry relative/absolute paths that simply lack an extension.
    if (!specifier.startsWith('.') && !specifier.startsWith('/')) throw err;
    for (const ext of ['.js', '.mjs', '.jsx', '/index.js']) {
      try {
        return await next(specifier + ext, context);
      } catch { /* try the next candidate */ }
    }
    throw err;
  }
}
