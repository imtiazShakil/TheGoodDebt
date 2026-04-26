import { createLedgerEntry } from "../ipc/register-transactions";
import { orm } from "./db";
import { BorrowingContract } from "./entity/borrowing-contract";
import { ContactDetails } from "./entity/contact-details";
import {
  ContractStatus,
  FinanceCategoryType,
  LendingContract,
} from "./entity/lending-contract";
import { ExpenseType, TransactionType } from "./entity/transaction";
import { Vault } from "./entity/vault";

function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function addDaysDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function initializeDatabase() {
  const em = orm.em.fork();
  if ((await em.count(ContactDetails)) > 0) return;

  const john = em.create(ContactDetails, {
    name: "John Doe",
    fatherName: "John Doe Sr.",
    nidInfo: "100001",
    phone: "0170000001",
    address: "123 Main St.",
  });
  const alice = em.create(ContactDetails, {
    name: "Alice Rahman",
    fatherName: "Abdul Rahman",
    nidInfo: "100002",
    phone: "0170000002",
    address: "45 Park Ave.",
  });
  const jane = em.create(ContactDetails, {
    name: "Jane Dutch",
    fatherName: "James Dutch",
    nidInfo: "100003",
    phone: "0170000003",
    address: "987 Elm St.",
  });
  const karim = em.create(ContactDetails, {
    name: "Karim Uddin",
    fatherName: "Jalal Uddin",
    nidInfo: "100004",
    phone: "0170000004",
    address: "12 Lake Rd.",
  });
  const omar = em.create(ContactDetails, {
    name: "Omar Faruq",
    fatherName: "Hasan Faruq",
    nidInfo: "100005",
    phone: "0170000005",
    address: "88 River Side",
  });
  await em.persistAndFlush([john, alice, jane, karim, omar]);
  console.log("Contacts seeded");

  const main = em.create(Vault, {
    name: "Main Treasury",
    description: "Primary operating vault",
  } as unknown as Vault);
  const reserve = em.create(Vault, {
    name: "Reserve Fund",
    description: "Long-term reserve",
  } as unknown as Vault);
  await em.persistAndFlush([main, reserve]);
  console.log("Vaults seeded");

  const lc1 = em.create(LendingContract, {
    contact: john,
    amount: 50000,
    durationDays: 365,
    returnDate: addDaysISO(365),
    financeCategoryType: FinanceCategoryType.QardAlHasan,
    reasonForLending: "Qard al-Hasan seed from John Doe",
    contractStatus: ContractStatus.Active,
  } as unknown as LendingContract);
  em.persist(lc1);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: main.id,
    amount: lc1.amount,
    transactionType: TransactionType.Lend,
    financeCategoryType: lc1.financeCategoryType,
    description: lc1.reasonForLending ?? "",
    contactId: john.id,
    lendingContractId: lc1.id,
  });

  const lc2 = em.create(LendingContract, {
    contact: alice,
    amount: 20000,
    durationDays: 180,
    returnDate: addDaysISO(180),
    financeCategoryType: FinanceCategoryType.Zakat,
    reasonForLending: "Zakat contribution from Alice Rahman",
    contractStatus: ContractStatus.Active,
  } as unknown as LendingContract);
  em.persist(lc2);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: main.id,
    amount: lc2.amount,
    transactionType: TransactionType.Lend,
    financeCategoryType: lc2.financeCategoryType,
    description: lc2.reasonForLending ?? "",
    contactId: alice.id,
    lendingContractId: lc2.id,
  });

  const lc3 = em.create(LendingContract, {
    contact: alice,
    amount: 30000,
    durationDays: 365,
    returnDate: addDaysISO(365),
    financeCategoryType: FinanceCategoryType.Waqf,
    reasonForLending: "Waqf endowment from Alice Rahman",
    contractStatus: ContractStatus.Active,
  } as unknown as LendingContract);
  em.persist(lc3);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: reserve.id,
    amount: lc3.amount,
    transactionType: TransactionType.Lend,
    financeCategoryType: lc3.financeCategoryType,
    description: lc3.reasonForLending ?? "",
    contactId: alice.id,
    lendingContractId: lc3.id,
  });

  const lc4 = em.create(LendingContract, {
    contact: john,
    amount: 25000,
    durationDays: 365,
    returnDate: addDaysISO(365),
    financeCategoryType: FinanceCategoryType.Sadaqa,
    reasonForLending: "Sadaqa donation from John Doe",
    contractStatus: ContractStatus.Active,
  } as unknown as LendingContract);
  em.persist(lc4);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: reserve.id,
    amount: lc4.amount,
    transactionType: TransactionType.Lend,
    financeCategoryType: lc4.financeCategoryType,
    description: lc4.reasonForLending ?? "",
    contactId: john.id,
    lendingContractId: lc4.id,
  });
  console.log("Lending contracts seeded");

  const bc1 = em.create(BorrowingContract, {
    contact: jane,
    amount: 15000,
    durationDays: 90,
    returnDate: addDaysDate(90),
    financeCategoryType: FinanceCategoryType.QardAlHasan,
    purposeOfLoan: "Small business bridge loan",
    guarantor1: omar,
    contractStatus: ContractStatus.Active,
  } as unknown as BorrowingContract);
  em.persist(bc1);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: main.id,
    amount: bc1.amount,
    transactionType: TransactionType.Borrow,
    financeCategoryType: bc1.financeCategoryType,
    description: bc1.purposeOfLoan ?? "",
    contactId: jane.id,
    borrowingContractId: bc1.id,
  });

  const bc2 = em.create(BorrowingContract, {
    contact: karim,
    amount: 8000,
    durationDays: 60,
    returnDate: addDaysDate(60),
    financeCategoryType: FinanceCategoryType.Sadaqa,
    purposeOfLoan: "Medical emergency support",
    guarantor1: omar,
    contractStatus: ContractStatus.Active,
  } as unknown as BorrowingContract);
  em.persist(bc2);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: reserve.id,
    amount: bc2.amount,
    transactionType: TransactionType.Borrow,
    financeCategoryType: bc2.financeCategoryType,
    description: bc2.purposeOfLoan ?? "",
    contactId: karim.id,
    borrowingContractId: bc2.id,
  });
  console.log("Borrowing contracts seeded");

  await createLedgerEntry(em, {
    vaultId: main.id,
    amount: 3000,
    transactionType: TransactionType.BorrowRepay,
    financeCategoryType: FinanceCategoryType.QardAlHasan,
    description: "Partial repayment from Jane Dutch",
    contactId: jane.id,
    borrowingContractId: bc1.id,
  });

  await createLedgerEntry(em, {
    vaultId: main.id,
    amount: 100,
    transactionType: TransactionType.Expense,
    financeCategoryType: FinanceCategoryType.QardAlHasan,
    description: "Monthly bank charge",
    expenseType: ExpenseType.BankCharge,
  });
  console.log("Demo transactions seeded");
}
