import { Entity, Property } from "@mikro-orm/core";
import { BaseModel } from "./base-model";

@Entity()
export class ContactDetails extends BaseModel {
  @Property({ unique: true })
  name!: string;

  @Property()
  fatherName!: string;

  @Property({ unique: true })
  nidInfo!: string;

  @Property({ unique: true })
  phone!: string;

  @Property()
  address!: string;
}
