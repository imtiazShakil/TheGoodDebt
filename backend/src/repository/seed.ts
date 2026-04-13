import { orm } from "./db";
import { ContactDetails } from "./entity/contact-details";
import { Vault } from "./entity/vault";

export async function initializeDatabase() {
  const em = orm.em.fork();

  // if contacts exists, do not seed
  const contactCount = await em.count(ContactDetails);
  if (contactCount > 0) return;

  const lender1 = new ContactDetails();
  lender1.name = "John Doe";
  lender1.fatherName = "John Doe Sr.";
  lender1.nidInfo = "123456789";
  lender1.phone = "123456789";
  lender1.address = "123 Main St.";

  const borrower1 = new ContactDetails();
  borrower1.name = "Jane Dutch";
  borrower1.fatherName = "Jane Dutch Sr.";
  borrower1.nidInfo = "987654321";
  borrower1.phone = "987654321";
  borrower1.address = "987 Elm St.";

  await em.persistAndFlush([lender1, borrower1]);
  console.log("Contacts have been saved");

  const vault1 = new Vault();
  vault1.name = "Vault 1";
  vault1.description = "This is the first vault";
  
  await em.persistAndFlush(vault1);
  console.log("Vaults have been saved");
}
