// .cts (not .ts) forces TypeScript to emit CommonJS output regardless of the
// package-level "type": "module". Electron's sandboxed preload runner does not
// support ESM — renaming to .cts is the minimal fix that keeps the rest of the
// backend as ESM without adding a separate tsconfig or disabling the sandbox.
import { contextBridge, ipcRenderer } from "electron";

const APP_ERR_PREFIX = "__APP_ERR__:";

/**
 * Wraps every ipcRenderer.invoke call. On failure, AppErrors are unpacked to
 * `{ code, values }` and plain Errors to `{ message }` — both are plain objects
 * that contextBridge can fully serialize to the renderer.
 */
function invoke(channel: string, data?: unknown) {
  return ipcRenderer.invoke(channel, data).catch((err: Error) => {
    const idx = err.message?.indexOf(APP_ERR_PREFIX) ?? -1;
    if (idx !== -1) {
      throw JSON.parse(err.message.slice(idx + APP_ERR_PREFIX.length));
    }
    throw { message: err.message ?? String(err) };
  });
}

contextBridge.exposeInMainWorld("electronAPI", {
  getRequest: (name: string) => invoke(name),
  postRequest: (name: string, data: any) => invoke(name, data),
  putRequest: (name: string, data: any) => invoke(name, data),
  deleteRequest: (name: string, data: any) => invoke(name, data),
});
