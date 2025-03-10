import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),
  getRequest: (requestName: string) => ipcRenderer.invoke(requestName),
  postRequest: (requestName: string, data: any) =>
    ipcRenderer.invoke(requestName, data),
  // we can also expose variables, not just functions
});
