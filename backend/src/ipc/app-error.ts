/** Sentinel prefix that identifies a structured AppError encoded in an Error message string. */
export const APP_ERR_PREFIX = "__APP_ERR__:";

/**
 * User-facing error that survives Electron's IPC serialization boundary.
 * Encodes an i18n key and optional interpolation values into the Error message
 * so the preload can reconstruct a typed `{ code, values }` object.
 */
export class AppError extends Error {
  constructor(code: string, values?: Record<string, unknown>) {
    super(`${APP_ERR_PREFIX}${JSON.stringify({ code, values })}`);
    this.name = "AppError";
  }
}
