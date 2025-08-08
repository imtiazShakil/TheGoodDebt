import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class ContactDetails {
  @PrimaryKey()
  id!: number;

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
