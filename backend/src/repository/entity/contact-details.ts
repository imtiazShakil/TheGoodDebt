import { Entity, Property } from "@mikro-orm/core";
import { BaseModel } from "./base-model";

/** A person who can act as a lender (donor), borrower (beneficiary), or guarantor on a contract. */
@Entity()
export class ContactDetails extends BaseModel {
  @Property({ type: "string", unique: true })
  name!: string;

  @Property({ type: "string" })
  fatherName!: string;

  @Property({ type: "string", unique: true })
  nidInfo!: string;

  @Property({ type: "string", unique: true })
  phone!: string;

  @Property({ type: "string" })
  address!: string;
}
