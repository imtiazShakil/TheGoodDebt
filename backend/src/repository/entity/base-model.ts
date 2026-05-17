import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/es";
import { OptionalProps } from "@mikro-orm/core";

export type BaseOptionalProps = "id" | "createdAt" | "updatedAt" | "version";

/** Abstract base entity providing auto-managed id, created/updated timestamps, and an optimistic-lock version. */
@Entity({ abstract: true })
export abstract class BaseModel<Optional extends string = never> {
  [OptionalProps]?: BaseOptionalProps | Optional;

  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "datetime", onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({
    type: "datetime",
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();

  @Property({ type: "number", version: true })
  version: number = 1;
}
