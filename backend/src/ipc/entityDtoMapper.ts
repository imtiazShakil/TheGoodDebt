/**
 * Pure functions that project MikroORM entities into the response DTOs
 * declared in `contract.ts`. Used at every handler return site so handlers
 * never emit raw entities — that way `version`, lazy `fileBlob`, and any
 * ORM-internal fields are guaranteed not to cross the IPC boundary.
 */
import { BorrowingContract } from "../repository/entity/borrowing-contract.js";
import { ContactDetails } from "../repository/entity/contact-details.js";
import { LendingContract } from "../repository/entity/lending-contract.js";
import { Transaction } from "../repository/entity/transaction.js";
import { Vault } from "../repository/entity/vault.js";
import { VaultBalanceHistory } from "../repository/entity/vault-balance-history.js";
import {
  BorrowingContractDto,
  ContactDto,
  LendingContractDto,
  TransactionDto,
  VaultBalanceHistoryDto,
  VaultDto,
  VaultWithLatestBalanceDto,
} from "./contract.js";

export function toContactDto(c: ContactDetails): ContactDto {
  return {
    id: c.id,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    name: c.name,
    fatherName: c.fatherName,
    nidInfo: c.nidInfo,
    phone: c.phone,
    address: c.address,
  };
}

export function toVaultDto(v: Vault): VaultDto {
  return {
    id: v.id,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    name: v.name,
    description: v.description,
  };
}

export function toVaultBalanceHistoryDto(
  vbh: VaultBalanceHistory,
): VaultBalanceHistoryDto {
  return {
    id: vbh.id,
    createdAt: vbh.createdAt,
    updatedAt: vbh.updatedAt,
    qardAlHasanBalance: vbh.qardAlHasanBalance,
    zakatBalance: vbh.zakatBalance,
    sadaqaBalance: vbh.sadaqaBalance,
    waqfBalance: vbh.waqfBalance,
    totalBalance: vbh.totalBalance,
  };
}

export function toVaultWithLatestBalanceDto(
  v: Vault,
  latest: VaultBalanceHistory | null,
): VaultWithLatestBalanceDto {
  return {
    ...toVaultDto(v),
    latestBalance: latest ? toVaultBalanceHistoryDto(latest) : undefined,
  };
}

export function toLendingContractDto(
  c: LendingContract,
  totalRepaid: number,
): LendingContractDto {
  return {
    id: c.id,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    contact: toContactDto(c.contact),
    amount: c.amount,
    durationDays: c.durationDays,
    returnDate: c.returnDate,
    financeCategoryType: c.financeCategoryType,
    reasonForLending: c.reasonForLending,
    contractStatus: c.contractStatus,
    fileName: c.fileName,
    totalRepaid,
  };
}

export function toBorrowingContractDto(
  c: BorrowingContract,
  totalRepaid: number,
): BorrowingContractDto {
  return {
    id: c.id,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    contact: toContactDto(c.contact),
    amount: c.amount,
    durationDays: c.durationDays,
    returnDate: c.returnDate,
    financeCategoryType: c.financeCategoryType,
    purposeOfLoan: c.purposeOfLoan,
    guarantor1: c.guarantor1 ? toContactDto(c.guarantor1) : undefined,
    guarantor2: c.guarantor2 ? toContactDto(c.guarantor2) : undefined,
    firstReminder: c.firstReminder ?? undefined,
    secondReminder: c.secondReminder ?? undefined,
    thirdReminder: c.thirdReminder ?? undefined,
    guarantorsReminder: c.guarantorsReminder ?? undefined,
    contractStatus: c.contractStatus,
    adjustmentWithTransactionId: c.adjustmentWithTransactionId,
    fileName: c.fileName,
    totalRepaid,
  };
}

/**
 * Maps a populated Transaction. Nested contract DTOs carry `totalRepaid: 0` —
 * the transactions view shows the contract's identity, not its repayment
 * progress, so we don't pay for the extra query.
 */
export function toTransactionDto(t: Transaction): TransactionDto {
  return {
    id: t.id,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    description: t.description,
    amount: t.amount,
    transactionType: t.transactionType,
    expenseType: t.expenseType,
    vault: toVaultDto(t.vault),
    contact: t.contact ? toContactDto(t.contact) : undefined,
    financeCategoryType: t.financeCategoryType,
    lendingContract: t.lendingContract
      ? toLendingContractDto(t.lendingContract, 0)
      : undefined,
    borrowingContract: t.borrowingContract
      ? toBorrowingContractDto(t.borrowingContract, 0)
      : undefined,
    balance: t.balance,
  };
}
