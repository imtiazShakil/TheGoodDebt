import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";

export type BaseOptionalProps = "id" | "createdAt" | "updatedAt" | "version";

@Entity({ abstract: true })
export abstract class BaseModel<Optional extends string = never> {
  [OptionalProps]?: BaseOptionalProps | Optional;

  @PrimaryKey()
  id!: number;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ version: true })
  version: number = 1;
}
