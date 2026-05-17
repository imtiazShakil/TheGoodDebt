import { Entity, ManyToOne, Property } from "@mikro-orm/decorators/es";
import { BaseModel } from "./base-model.js";
import { Transaction } from "./transaction.js";
import { Vault } from "./vault.js";

/** Per-category balance snapshot recorded for a vault after each transaction. Used to derive current balances without replaying the ledger. */
@Entity()
export class VaultBalanceHistory extends BaseModel {
  @ManyToOne(() => Vault)
  vault!: Vault;

  @ManyToOne(() => Transaction, { nullable: true })
  transaction?: Transaction;

  @Property({ type: "number" })
  qardAlHasanBalance: number = 0;

  @Property({ type: "number" })
  zakatBalance: number = 0;

  @Property({ type: "number" })
  sadaqaBalance: number = 0;

  @Property({ type: "number" })
  waqfBalance: number = 0;

  @Property({ type: "number" })
  totalBalance: number = 0;
}
