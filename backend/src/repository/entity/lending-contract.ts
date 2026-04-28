import { DateType, Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseModel } from "./base-model";
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

/** Records money coming IN to the fund — a donor or lender contributing to the organisation. */
@Entity()
export class LendingContract extends BaseModel<"contractStatus"> {
  @ManyToOne(() => ContactDetails)
  contact!: ContactDetails;

  @Property()
  amount!: number;

  @Property()
  durationDays!: number;

  @Property({ type: DateType })
  returnDate!: string; // Stored as 'YYYY-MM-DD'

  @Property()
  financeCategoryType!: FinanceCategoryType;

  @Property({ nullable: true })
  reasonForLending?: string;

  @Property()
  contractStatus: ContractStatus = ContractStatus.Active;
}
