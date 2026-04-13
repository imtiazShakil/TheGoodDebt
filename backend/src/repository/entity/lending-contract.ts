import { DateType, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { ContactDetails } from "./contact-details";

export enum FinanceCategoryType {
  QardAlHasan = "Qard al-Hasan",
  Zakat = "Zakat",
  Sadaqa = "Sadaqa",
  Waqf = "Waqf",
}

export enum ContractStatus {
  Active = "Active",
  Completed = "Completed",
  Defaulted = "Defaulted",
}

@Entity()
export class LendingContract {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => ContactDetails)
  contact!: ContactDetails;

  @Property()
  amount!: number;

  @Property()
  durationDays!: number;

  @Property({ type: DateType })
  returnDate!: string; // Stored as 'YYYY-MM-DD';

  @Property()
  financeCategoryType!: FinanceCategoryType;

  @Property({ nullable: true })
  reasonForLending?: string;

  @Property()
  contractStatus: ContractStatus = ContractStatus.Active;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
