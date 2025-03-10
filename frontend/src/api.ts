import { ContactDetails } from "./entity.interface";

export function getContacts(): Promise<ContactDetails[]> {
  if (!window.electronAPI) return Promise.resolve([]);

  return window.electronAPI.getRequest("GET contacts");
}

export function addContact(
  contact: ContactDetails,
): Promise<ContactDetails | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.postRequest("POST contacts", contact);
}
