import { IpcMain } from "electron";
import { orm } from "../repository/db";
import { ContactDetails } from "../repository/entity/contact-details";
import { BorrowingContract } from "../repository/entity/borrowing-contract";

export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle("GET borrowing-contracts", async () => {
    const em = orm.em.fork();
    return await em.findAll(BorrowingContract, {
      populate: ["contact", "guarantor1", "guarantor2"],
    });
  });

  ipcMain.handle("POST borrowing-contracts", async (_event, data) => {
    data.id = undefined;
    const em = orm.em.fork();
    const contract = em.create(BorrowingContract, {
      ...data,
      contact: em.getReference(ContactDetails, data.contact.id),
      guarantor1: data.guarantor1?.id
        ? em.getReference(ContactDetails, data.guarantor1.id)
        : null,
      guarantor2: data.guarantor2?.id
        ? em.getReference(ContactDetails, data.guarantor2.id)
        : null,
    });
    await em.persistAndFlush(contract);
    await em.populate(contract, ["contact", "guarantor1", "guarantor2"]);
    return contract;
  });

  ipcMain.handle("PUT borrowing-contracts", async (_event, data) => {
    const em = orm.em.fork();
    const contract = await em.findOneOrFail(BorrowingContract, { id: data.id });
    contract.contact = em.getReference(ContactDetails, data.contact.id);
    contract.amount = data.amount;
    contract.durationDays = data.durationDays;
    contract.returnDate = data.returnDate;
    contract.financeCategoryType = data.financeCategoryType;
    contract.purposeOfLoan = data.purposeOfLoan;
    contract.guarantor1 = data.guarantor1?.id
      ? em.getReference(ContactDetails, data.guarantor1.id)
      : undefined;
    contract.guarantor2 = data.guarantor2?.id
      ? em.getReference(ContactDetails, data.guarantor2.id)
      : undefined;
    contract.loanRecallStatus = data.loanRecallStatus || undefined;
    contract.contractStatus = data.contractStatus;
    contract.adjustmentWithTransactionId =
      data.adjustmentWithTransactionId || undefined;
    await em.persistAndFlush(contract);
    await em.populate(contract, ["contact", "guarantor1", "guarantor2"]);
    return contract;
  });

  ipcMain.handle("DELETE borrowing-contracts", async (_event, data) => {
    const em = orm.em.fork();
    const contract = await em.findOneOrFail(BorrowingContract, { id: data.id });
    await em.removeAndFlush(contract);
    return { id: data.id };
  });
}
