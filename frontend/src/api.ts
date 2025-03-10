import { ContactDetails } from "./entity.interface";

export function getContacts(): Promise<ContactDetails[]> {
  if (!window.electronAPI) return Promise.resolve([]);

  return window.electronAPI.getRequest("GET contacts");
}
