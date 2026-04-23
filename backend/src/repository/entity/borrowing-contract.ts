import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { ContactDetails } from "./contact-details";
import {
  ContractStatus,
  FinanceCategoryType,
} from "./lending-contract";

export enum LoanRecallStatus {
  FirstReminder = "1st Reminder",
  SecondReminder = "2nd Reminder",
  ThirdReminder = "3rd Reminder",
  GuarantorsReminder = "Guarantors reminder",
}

@Entity()
export class BorrowingContract {
  @PrimaryKey()
  id!: number;

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

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
