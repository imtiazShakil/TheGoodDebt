import { Entity, Property } from "@mikro-orm/decorators/es";
import { BaseModel } from "./base-model.js";

export enum AuditOperation {
  Create = "CREATE",
  Update = "UPDATE",
  Delete = "DELETE",
}

/** Append-only audit row written by AuditSubscriber on every entity create/update/delete. */
@Entity()
export class AuditLog extends BaseModel {
  @Property({ type: "string" })
  entityName!: string;

  @Property({ type: "number" })
  entityId!: number;

  @Property({ type: "string" })
  operation!: AuditOperation;

  @Property({ type: "json" })
  changes!: Record<string, unknown>;
}
