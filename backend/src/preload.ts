import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getRequest: (requestName: string) => ipcRenderer.invoke(requestName),
  postRequest: (requestName: string, data: any) =>
    ipcRenderer.invoke(requestName, data),
  putRequest: (requestName: string, data: any) =>
    ipcRenderer.invoke(requestName, data),
  // we can also expose variables, not just functions
});
