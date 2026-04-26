import { Entity, Property } from "@mikro-orm/core";
import { BaseModel } from "./base-model";

@Entity()
export class Vault extends BaseModel {
  @Property({ unique: true })
  name!: string;

  @Property({ nullable: true })
  description?: string;
}
