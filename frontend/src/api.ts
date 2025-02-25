export function getContacts() {
  if (!window.electronAPI) return Promise.resolve([]);

  return window.electronAPI.getRequest("GET contacts");
}
