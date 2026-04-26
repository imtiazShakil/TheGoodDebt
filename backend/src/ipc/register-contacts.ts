import { IpcMain } from "electron";
import { orm } from "../repository/db";
import { ContactDetails } from "../repository/entity/contact-details";

export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle("GET contacts", async () => {
    const em = orm.em.fork();
    return await em.findAll(ContactDetails);
  });

  ipcMain.handle("POST contacts", async (_event, data) => {
    data.id = undefined;
    const em = orm.em.fork();
    const contact = em.create(ContactDetails, data);
    await em.persistAndFlush(contact);
    return contact;
  });

  ipcMain.handle("PUT contacts", async (_event, data) => {
    const em = orm.em.fork();
    const contact = await em.findOneOrFail(ContactDetails, { id: data.id });
    contact.name = data.name;
    contact.fatherName = data.fatherName;
    contact.nidInfo = data.nidInfo;
    contact.address = data.address;
    contact.phone = data.phone;
    await em.persistAndFlush(contact);
    return contact;
  });

  ipcMain.handle("SEARCH contacts", async (_event, data) => {
    const em = orm.em.fork();
    return await em.find(ContactDetails, {
      name: { $like: `%${data.query}%` },
    });
  });
}
