import { IpcMain } from "electron";
import { orm } from "../repository/db.js";
import { ContactDetails } from "../repository/entity/contact-details.js";
import {
  ContactCreateInput,
  ContactDto,
  ContactSearchInput,
  ContactUpdateInput,
} from "./contract.js";
import { toContactDto } from "./entityDtoMapper.js";

/** Registers IPC handlers for CRUD operations on ContactDetails. */
export function registerHandlers(ipcMain: IpcMain) {
  ipcMain.handle("GET contacts", async (): Promise<ContactDto[]> => {
    const em = orm.em.fork();
    const contacts = await em.findAll(ContactDetails);
    return contacts.map(toContactDto);
  });

  ipcMain.handle(
    "POST contacts",
    async (_event, data: ContactCreateInput): Promise<ContactDto> => {
      const em = orm.em.fork();
      // Pick only the input fields explicitly — the frontend sends the full
      // ContactDetails entity (including an empty `id: ""` for new contacts),
      // so spreading `data` directly would push a bogus id into em.create.
      const contact = em.create(ContactDetails, {
        name: data.name,
        fatherName: data.fatherName,
        nidInfo: data.nidInfo,
        phone: data.phone,
        address: data.address,
      });
      await em.persist(contact).flush();
      return toContactDto(contact);
    },
  );

  ipcMain.handle(
    "PUT contacts",
    async (_event, data: ContactUpdateInput): Promise<ContactDto> => {
      const em = orm.em.fork();
      const contact = await em.findOneOrFail(ContactDetails, { id: data.id });
      contact.name = data.name;
      contact.fatherName = data.fatherName;
      contact.nidInfo = data.nidInfo;
      contact.address = data.address;
      contact.phone = data.phone;
      await em.persist(contact).flush();
      return toContactDto(contact);
    },
  );

  ipcMain.handle(
    "SEARCH contacts",
    async (_event, data: ContactSearchInput): Promise<ContactDto[]> => {
      const em = orm.em.fork();
      const contacts = await em.find(ContactDetails, {
        name: { $like: `%${data.query}%` },
      });
      return contacts.map(toContactDto);
    },
  );
}
