import { contextBridge, ipcRenderer } from "electron";

const APP_ERR_PREFIX = "__APP_ERR__:";

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
