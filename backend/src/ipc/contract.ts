/**
 * Type-only contract for the IPC boundary. Every handler in this folder
 * annotates its `data` parameter and return type against the types declared
 * here, so a misread field name (`data.contact.id` vs `data.contactId`) or a
 * drifted response shape is a compile error rather than a runtime surprise.
 *
 * Mirrors what `frontend/src/entity.interface.d.ts` declares today; the two
 * sides are kept in sync manually by intention (see plan in
 * `.claude/plans/proper-type-information-is-binary-reddy.md`).
 */
import {
  ContractStatus,
  FinanceCategoryType,
} from "../repository/entity/lending-contract.js";
import {
  ExpenseType,
  TransactionType,
} from "../repository/entity/transaction.js";

// ============================================================================
// Response DTOs — what each handler returns. Lazy `fileBlob` and the
// optimistic-lock `version` are deliberately omitted so they never leak.
// ============================================================================

export interface ContactDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  fatherName: string;
  nidInfo: string;
  phone: string;
  address: string;
}

export interface VaultDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
}

export interface VaultBalanceHistoryDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  qardAlHasanBalance: number;
  zakatBalance: number;
  sadaqaBalance: number;
  waqfBalance: number;
  totalBalance: number;
}

export interface VaultWithLatestBalanceDto extends VaultDto {
  latestBalance?: VaultBalanceHistoryDto;
}

export interface LendingContractDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  contact: ContactDto;
  amount: number;
  durationDays: number;
  returnDate: Date;
  financeCategoryType: FinanceCategoryType;
  reasonForLending?: string;
  contractStatus: ContractStatus;
  fileName?: string;
  totalRepaid: number;
}

export interface BorrowingContractDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  contact: ContactDto;
  amount: number;
  durationDays: number;
  returnDate: Date;
  financeCategoryType: FinanceCategoryType;
  purposeOfLoan?: string;
  guarantor1?: ContactDto;
  guarantor2?: ContactDto;
  firstReminder?: Date;
  secondReminder?: Date;
  thirdReminder?: Date;
  guarantorsReminder?: Date;
  contractStatus: ContractStatus;
  adjustmentWithTransactionId?: number;
  fileName?: string;
  totalRepaid: number;
}

export interface TransactionDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  amount: number;
  transactionType: TransactionType;
  expenseType?: ExpenseType;
  vault: VaultDto;
  contact?: ContactDto;
  financeCategoryType: FinanceCategoryType;
  lendingContract?: LendingContractDto;
  borrowingContract?: BorrowingContractDto;
  balance: number;
}

export interface AttachedFileDto {
  fileName: string;
  bytes: Uint8Array;
}

export interface DeleteResultDto {
  id: number;
}

// ============================================================================
// Request inputs — the shape each handler reads off `data`. Inputs declare
// only the fields the backend actually consumes (e.g. `contact: { id }` rather
// than the full ContactDetails the frontend happens to send), so the contract
// is documenting what the backend depends on, not what the frontend happens
// to ship.
// ============================================================================

export interface ContactCreateInput {
  name: string;
  fatherName: string;
  nidInfo: string;
  phone: string;
  address: string;
}

export interface ContactUpdateInput extends ContactCreateInput {
  id: number;
}

export interface ContactSearchInput {
  query: string;
}

export interface VaultCreateInput {
  name: string;
  description?: string;
}

export interface VaultUpdateInput extends VaultCreateInput {
  id: number;
}

export interface VaultDeleteInput {
  id: number;
}

export interface VaultBalanceHistoryQueryInput {
  vaultId: number;
}

export interface LendingContractCreateInput {
  contact: { id: number };
  amount: number;
  durationDays: number;
  returnDate: Date;
  financeCategoryType: FinanceCategoryType;
  reasonForLending?: string;
  vaultId: number;
  attachedFile?: AttachedFileDto;
}

export interface LendingContractUpdateInput {
  id: number;
  durationDays: number;
  returnDate: Date;
  reasonForLending?: string;
  attachedFile?: AttachedFileDto;
}

export interface LendingContractFileInput {
  contractId: number;
}

export interface LendingContractDeleteInput {
  id: number;
}

export interface BorrowingContractCreateInput {
  contact: { id: number };
  amount: number;
  durationDays: number;
  returnDate: Date;
  financeCategoryType: FinanceCategoryType;
  purposeOfLoan?: string;
  guarantor1?: { id: number };
  guarantor2?: { id: number };
  firstReminder?: Date | null;
  secondReminder?: Date | null;
  thirdReminder?: Date | null;
  guarantorsReminder?: Date | null;
  vaultId: number;
  attachedFile?: AttachedFileDto;
}

export interface BorrowingContractUpdateInput {
  id: number;
  durationDays: number;
  returnDate: Date;
  purposeOfLoan?: string;
  firstReminder?: Date | null;
  secondReminder?: Date | null;
  thirdReminder?: Date | null;
  guarantorsReminder?: Date | null;
  attachedFile?: AttachedFileDto;
}

export interface BorrowingContractFileInput {
  contractId: number;
}

export interface BorrowingContractDeleteInput {
  id: number;
}

export interface TransactionCreateInput {
  vault: { id: number };
  contact?: { id: number };
  lendingContract?: { id: number };
  borrowingContract?: { id: number };
  transactionType: TransactionType;
  financeCategoryType: FinanceCategoryType;
  description: string;
  amount: number;
  expenseType?: ExpenseType;
}

export interface TransactionUpdateInput {
  id: number;
  description: string;
}

export interface TransactionDeleteInput {
  id: number;
}
