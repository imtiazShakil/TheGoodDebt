export interface IElectronAPI {
    getRequest: (requestName: string) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
