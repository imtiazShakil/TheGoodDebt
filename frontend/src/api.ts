import {
  BorrowingContract,
  ContactDetails,
  LendingContract,
  Vault,
  VaultBalanceHistory,
} from "./entity.interface";

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

export function getVaultBalanceHistory(
  vaultId: number,
): Promise<VaultBalanceHistory[]> {
  if (!window.electronAPI) return Promise.resolve([]);

  return window.electronAPI.postRequest("GET vault-balance-history", {
    vaultId,
  });
}

export function searchContacts(query: string): Promise<ContactDetails[]> {
  if (!window.electronAPI) return Promise.resolve([]);

  return window.electronAPI.postRequest("SEARCH contacts", { query });
}

export function getLendingContracts(): Promise<LendingContract[]> {
  if (!window.electronAPI) return Promise.resolve([]);

  return window.electronAPI.getRequest("GET lending-contracts");
}

export function addLendingContract(
  contract: LendingContract,
): Promise<LendingContract | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.postRequest("POST lending-contracts", contract);
}

export function editLendingContract(
  contract: LendingContract,
): Promise<LendingContract | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.putRequest("PUT lending-contracts", contract);
}

export function deleteLendingContract(
  id: number,
): Promise<{ id: number } | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.deleteRequest("DELETE lending-contracts", { id });
}

export function getBorrowingContracts(): Promise<BorrowingContract[]> {
  if (!window.electronAPI) return Promise.resolve([]);

  return window.electronAPI.getRequest("GET borrowing-contracts");
}

export function addBorrowingContract(
  contract: BorrowingContract,
): Promise<BorrowingContract | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.postRequest("POST borrowing-contracts", contract);
}

export function editBorrowingContract(
  contract: BorrowingContract,
): Promise<BorrowingContract | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.putRequest("PUT borrowing-contracts", contract);
}

export function deleteBorrowingContract(
  id: number,
): Promise<{ id: number } | null> {
  if (!window.electronAPI) return Promise.resolve(null);

  return window.electronAPI.deleteRequest("DELETE borrowing-contracts", { id });
}
