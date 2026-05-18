import { Entity, ManyToOne, Property } from "@mikro-orm/decorators/es";
import { BaseModel } from "./base-model.js";
import { ContactDetails } from "./contact-details.js";
import { ContractStatus, FinanceCategoryType } from "./lending-contract.js";

/** Records money going OUT from the fund — the organisation lending to a beneficiary (Qard al-Hasan etc.). */
@Entity()
export class BorrowingContract extends BaseModel<"contractStatus"> {
  @ManyToOne(() => ContactDetails)
  contact!: ContactDetails;

  @Property({ type: "number" })
  amount!: number;

  @Property({ type: "number" })
  durationDays!: number;

  @Property({ type: "datetime" })
  returnDate!: Date;

  @Property({ type: "string" })
  financeCategoryType!: FinanceCategoryType;

  @Property({ type: "string", nullable: true })
  purposeOfLoan?: string;

  @ManyToOne(() => ContactDetails, { nullable: true })
  guarantor1?: ContactDetails;

  @ManyToOne(() => ContactDetails, { nullable: true })
  guarantor2?: ContactDetails;

  @Property({ type: "datetime", nullable: true })
  firstReminder?: Date | null;

  @Property({ type: "datetime", nullable: true })
  secondReminder?: Date | null;

  @Property({ type: "datetime", nullable: true })
  thirdReminder?: Date | null;

  @Property({ type: "datetime", nullable: true })
  guarantorsReminder?: Date | null;

  @Property({ type: "string" })
  contractStatus: ContractStatus = ContractStatus.Active;

  @Property({ type: "number", nullable: true })
  adjustmentWithTransactionId?: number;

  @Property({ type: "string", nullable: true })
  fileName?: string;

  // lazy: true — never loaded by default queries; only when explicitly requested
  // in `fields`. Keeps list/find queries cheap; blob is fetched only by the
  // dedicated download handler.
  @Property({ type: "blob", nullable: true, lazy: true })
  fileBlob?: Buffer;
}
