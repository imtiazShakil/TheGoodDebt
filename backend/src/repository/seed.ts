import { createLedgerEntry } from "../ipc/register-transactions";
import { orm } from "./db";
import { BorrowingContract } from "./entity/borrowing-contract";
import { ContactDetails } from "./entity/contact-details";
import {
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

  const rafiqul = em.create(ContactDetails, {
    name: "Mohammad Rafiqul Islam",
    fatherName: "Mohammad Ataur Rahman",
    nidInfo: "1987245360",
    phone: "01712345678",
    address: "House 12, Road 4, Mirpur-10, Dhaka",
  });
  const fatema = em.create(ContactDetails, {
    name: "Fatema Akter",
    fatherName: "Abul Kashem Mia",
    nidInfo: "1992456789",
    phone: "01819876543",
    address: "Village: Rampur, Upazila: Comilla Sadar, Comilla",
  });
  const karim = em.create(ContactDetails, {
    name: "Abdul Karim Chowdhury",
    fatherName: "Abdul Jabbar Chowdhury",
    nidInfo: "1978563412",
    phone: "01911234567",
    address: "Flat 3B, Nasirabad Housing Society, Chittagong",
  });
  const nasrin = em.create(ContactDetails, {
    name: "Nasrin Sultana",
    fatherName: "Mohammad Yunus Mia",
    nidInfo: "1995874321",
    phone: "01634567890",
    address: "Block D, House 7, Sylhet Sadar, Sylhet",
  });
  const sohrab = em.create(ContactDetails, {
    name: "Sohrab Hossain",
    fatherName: "Golam Hossain",
    nidInfo: "1983127654",
    phone: "01756789012",
    address: "Ward 5, Barishal Sadar, Barishal",
  });
  await em.persistAndFlush([rafiqul, fatema, karim, nasrin, sohrab]);
  console.log("Contacts seeded");

  const main = em.create(Vault, {
    name: "Masjid Baitul Aman Fund",
    description: "Primary operating fund for masjid welfare and Qard al-Hasan",
  });
  const reserve = em.create(Vault, {
    name: "Zakat & Sadaqa Reserve",
    description: "Dedicated reserve for Zakat, Sadaqa and Waqf disbursements",
  });
  await em.persistAndFlush([main, reserve]);
  console.log("Vaults seeded");

  // Lending contracts — money comes IN to the fund
  const lc1 = em.create(LendingContract, {
    contact: rafiqul,
    amount: 100000,
    durationDays: 365,
    returnDate: addDaysISO(365),
    financeCategoryType: FinanceCategoryType.QardAlHasan,
    reasonForLending: "Qard al-Hasan contribution from Mohammad Rafiqul Islam",
  });
  em.persist(lc1);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: main.id,
    amount: lc1.amount,
    transactionType: TransactionType.Lend,
    financeCategoryType: lc1.financeCategoryType,
    description: lc1.reasonForLending ?? "",
    contactId: rafiqul.id,
    lendingContractId: lc1.id,
  });

  const lc2 = em.create(LendingContract, {
    contact: fatema,
    amount: 50000,
    durationDays: 180,
    returnDate: addDaysISO(180),
    financeCategoryType: FinanceCategoryType.Zakat,
    reasonForLending: "Annual Zakat contribution from Fatema Akter",
  });
  em.persist(lc2);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: main.id,
    amount: lc2.amount,
    transactionType: TransactionType.Lend,
    financeCategoryType: lc2.financeCategoryType,
    description: lc2.reasonForLending ?? "",
    contactId: fatema.id,
    lendingContractId: lc2.id,
  });

  const lc3 = em.create(LendingContract, {
    contact: karim,
    amount: 75000,
    durationDays: 730,
    returnDate: addDaysISO(730),
    financeCategoryType: FinanceCategoryType.Waqf,
    reasonForLending: "Waqf endowment from Abdul Karim Chowdhury for masjid development",
  });
  em.persist(lc3);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: reserve.id,
    amount: lc3.amount,
    transactionType: TransactionType.Lend,
    financeCategoryType: lc3.financeCategoryType,
    description: lc3.reasonForLending ?? "",
    contactId: karim.id,
    lendingContractId: lc3.id,
  });

  const lc4 = em.create(LendingContract, {
    contact: nasrin,
    amount: 40000,
    durationDays: 365,
    returnDate: addDaysISO(365),
    financeCategoryType: FinanceCategoryType.Sadaqa,
    reasonForLending: "Sadaqa donation from Nasrin Sultana for community support",
  });
  em.persist(lc4);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: reserve.id,
    amount: lc4.amount,
    transactionType: TransactionType.Lend,
    financeCategoryType: lc4.financeCategoryType,
    description: lc4.reasonForLending ?? "",
    contactId: nasrin.id,
    lendingContractId: lc4.id,
  });
  console.log("Lending contracts seeded");

  // Borrowing contracts — fund lends money OUT
  // main QardAlHasan balance: 100,000 → bc1 draws 30,000
  const bc1 = em.create(BorrowingContract, {
    contact: karim,
    amount: 30000,
    durationDays: 120,
    returnDate: addDaysDate(120),
    financeCategoryType: FinanceCategoryType.QardAlHasan,
    purposeOfLoan: "Interest-free loan for small tailoring business startup",
    guarantor1: sohrab,
  });
  em.persist(bc1);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: main.id,
    amount: bc1.amount,
    transactionType: TransactionType.Borrow,
    financeCategoryType: bc1.financeCategoryType,
    description: bc1.purposeOfLoan ?? "",
    contactId: karim.id,
    borrowingContractId: bc1.id,
  });

  // reserve Sadaqa balance: 40,000 → bc2 draws 15,000
  const bc2 = em.create(BorrowingContract, {
    contact: fatema,
    amount: 15000,
    durationDays: 90,
    returnDate: addDaysDate(90),
    financeCategoryType: FinanceCategoryType.Sadaqa,
    purposeOfLoan: "Emergency medical assistance for family treatment",
    guarantor1: sohrab,
  });
  em.persist(bc2);
  await em.flush();
  await createLedgerEntry(em, {
    vaultId: reserve.id,
    amount: bc2.amount,
    transactionType: TransactionType.Borrow,
    financeCategoryType: bc2.financeCategoryType,
    description: bc2.purposeOfLoan ?? "",
    contactId: fatema.id,
    borrowingContractId: bc2.id,
  });
  console.log("Borrowing contracts seeded");

  await createLedgerEntry(em, {
    vaultId: main.id,
    amount: 10000,
    transactionType: TransactionType.BorrowRepay,
    financeCategoryType: FinanceCategoryType.QardAlHasan,
    description: "First installment repayment from Abdul Karim Chowdhury",
    contactId: karim.id,
    borrowingContractId: bc1.id,
  });

  await createLedgerEntry(em, {
    vaultId: main.id,
    amount: 500,
    transactionType: TransactionType.Expense,
    financeCategoryType: FinanceCategoryType.QardAlHasan,
    description: "Monthly bank statement and transfer charges",
    expenseType: ExpenseType.BankCharge,
  });
  console.log("Demo transactions seeded");
}
