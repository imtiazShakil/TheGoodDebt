import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseModel } from "./base-model";
import { ContactDetails } from "./contact-details";
import { ContractStatus, FinanceCategoryType } from "./lending-contract";

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
  firstReminder?: Date | null;

  @Property({ nullable: true })
  secondReminder?: Date | null;

  @Property({ nullable: true })
  thirdReminder?: Date | null;

  @Property({ nullable: true })
  guarantorsReminder?: Date | null;

  @Property()
  contractStatus: ContractStatus = ContractStatus.Active;

  @Property({ nullable: true })
  adjustmentWithTransactionId?: number;
}
