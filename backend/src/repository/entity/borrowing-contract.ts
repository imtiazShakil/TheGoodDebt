import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseModel } from "./base-model";
import { ContactDetails } from "./contact-details";
import { ContractStatus, FinanceCategoryType } from "./lending-contract";

export enum LoanRecallStatus {
  FirstReminder = "1st Reminder",
  SecondReminder = "2nd Reminder",
  ThirdReminder = "3rd Reminder",
  GuarantorsReminder = "Guarantors reminder",
}

/** Records money going OUT from the fund — the organisation lending to a beneficiary (Qard al-Hasan etc.). */
@Entity()
export class BorrowingContract extends BaseModel<"contractStatus"> {
  @ManyToOne(() => ContactDetails)
  contact!: ContactDetails;

  @Property()
  amount!: number;

  @Property()
  durationDays!: number;

  @Property()
  returnDate!: Date;

  @Property()
  financeCategoryType!: FinanceCategoryType;

  @Property({ nullable: true })
  purposeOfLoan?: string;

  @ManyToOne(() => ContactDetails, { nullable: true })
  guarantor1?: ContactDetails;

  @ManyToOne(() => ContactDetails, { nullable: true })
  guarantor2?: ContactDetails;

  @Property({ nullable: true })
  loanRecallStatus?: LoanRecallStatus;

  @Property()
  contractStatus: ContractStatus = ContractStatus.Active;

  @Property({ nullable: true })
  adjustmentWithTransactionId?: number;
}
