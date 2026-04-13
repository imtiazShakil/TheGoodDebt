export interface BaseEntity {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface ContactDetails extends BaseEntity {
  name: string;
  fatherName: string;
  nidInfo: string;
  phone: string;
  address: string;
}

export interface Vault extends BaseEntity {
  name: string;
  description?: string;
}

export interface LendingContract extends BaseEntity {
  contact: ContactDetails;
  amount: number;
  durationDays: number;
  returnDate: string;
  financeCategoryType: "Qard al-Hasan" | "Zakat" | "Sadaqa" | "Waqf";
  reasonForLending?: string;
  contractStatus: "Active" | "Completed" | "Defaulted";
}

export type FinanceCategoryType = LendingContract["financeCategoryType"];
export type ContractStatus = LendingContract["contractStatus"];
