import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Vault } from "./vault";
import { Transaction } from "./transaction";

@Entity()
export class VaultBalanceHistory {
  @PrimaryKey()
  id!: number;

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

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
