export interface IElectronAPI {
  getRequest: (requestName: string) => Promise<any>;
  postRequest: (requestName: string, data: any) => Promise<any>;
  putRequest: (requestName: string, data: any) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
