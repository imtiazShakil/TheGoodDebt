import { IpcMain } from "electron";
import { orm } from "../repository/db";
import { ContactDetails } from "../repository/entity/contact-details";
import { LendingContract } from "../repository/entity/lending-contract";

export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle("GET lending-contracts", async () => {
    const em = orm.em.fork();
    return await em.findAll(LendingContract, { populate: ["contact"] });
  });

  ipcMain.handle("POST lending-contracts", async (_event, data) => {
    data.id = undefined;
    const em = orm.em.fork();
    const contract = em.create(LendingContract, {
      ...data,
      contact: em.getReference(ContactDetails, data.contact.id),
    });
    await em.persistAndFlush(contract);
    await em.populate(contract, ["contact"]);
    return contract;
  });

  ipcMain.handle("PUT lending-contracts", async (_event, data) => {
    const em = orm.em.fork();
    const contract = await em.findOneOrFail(LendingContract, { id: data.id });
    contract.contact = em.getReference(ContactDetails, data.contact.id);
    contract.amount = data.amount;
    contract.durationDays = data.durationDays;
    contract.returnDate = data.returnDate;
    contract.financeCategoryType = data.financeCategoryType;
    contract.reasonForLending = data.reasonForLending;
    contract.contractStatus = data.contractStatus;
    await em.persistAndFlush(contract);
    await em.populate(contract, ["contact"]);
    return contract;
  });

  ipcMain.handle("DELETE lending-contracts", async (_event, data) => {
    const em = orm.em.fork();
    const contract = await em.findOneOrFail(LendingContract, { id: data.id });
    await em.removeAndFlush(contract);
    return { id: data.id };
  });
}
