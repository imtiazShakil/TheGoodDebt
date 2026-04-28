import { Entity, Property } from "@mikro-orm/core";
import { BaseModel } from "./base-model";

/** A named fund (e.g. "Masjid Zakat Fund") that holds per-category balances tracked via VaultBalanceHistory. */
@Entity()
export class Vault extends BaseModel {
  @Property({ unique: true })
  name!: string;

  @Property({ nullable: true })
  description?: string;
}
