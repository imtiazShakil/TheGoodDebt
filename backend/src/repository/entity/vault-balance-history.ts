import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseModel } from "./base-model";
import { Transaction } from "./transaction";
import { Vault } from "./vault";

/** Per-category balance snapshot recorded for a vault after each transaction. Used to derive current balances without replaying the ledger. */
@Entity()
export class VaultBalanceHistory extends BaseModel {
  @ManyToOne(() => Vault)
  vault!: Vault;

  @ManyToOne(() => Transaction, { nullable: true })
  transaction?: Transaction;

  @Property()
  qardAlHasanBalance: number = 0;

  @Property()
  zakatBalance: number = 0;

  @Property()
  sadaqaBalance: number = 0;

  @Property()
  waqfBalance: number = 0;

  @Property()
  totalBalance: number = 0;
}
