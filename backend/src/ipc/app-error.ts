export const APP_ERR_PREFIX = "__APP_ERR__:";

export class AppError extends Error {
  constructor(code: string, values?: Record<string, unknown>) {
    super(`${APP_ERR_PREFIX}${JSON.stringify({ code, values })}`);
    this.name = "AppError";
  }
}
