/**
 * Next.js middleware: delegates to proxy (security, auth checks).
 * File must be named middleware.ts at project root for Next.js to run it.
 */
export { proxy as default, config } from "./proxy"
