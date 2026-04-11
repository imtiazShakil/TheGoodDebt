import { ContactDetails, Vault } from "./entity.interface";

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

export function editContact(
  contact: ContactDetails,
): Promise<ContactDetails | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.putRequest("PUT contacts", contact);
}

export function getVaults(): Promise<Vault[]> {
  if (!window.electronAPI) return Promise.resolve([]);

  return window.electronAPI.getRequest("GET vaults");
}

export function addVault(vault: Vault): Promise<Vault | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.postRequest("POST vaults", vault);
}

export function editVault(vault: Vault): Promise<Vault | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.putRequest("PUT vaults", vault);
}

export function deleteVault(id: number): Promise<{ id: number } | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.deleteRequest("DELETE vaults", { id });
}
