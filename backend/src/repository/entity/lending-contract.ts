import { Entity, ManyToOne, Property } from "@mikro-orm/decorators/es";
import { BaseModel } from "./base-model.js";
import { ContactDetails } from "./contact-details.js";

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

  @Property({ type: "number" })
  amount!: number;

  @Property({ type: "number" })
  durationDays!: number;

  @Property({ type: "datetime" })
  returnDate!: Date; // Stored as 'YYYY-MM-DD'

  @Property({ type: "string" })
  financeCategoryType!: FinanceCategoryType;

  @Property({ type: "string", nullable: true })
  reasonForLending?: string;

  @Property({ type: "string" })
  contractStatus: ContractStatus = ContractStatus.Active;
}
