import { MikroORM } from "@mikro-orm/sqlite";
import config from "./mikro-orm.config";

export let orm: MikroORM;

export const initORM = async () => {
  orm = await MikroORM.init(config);
  await orm.schema.updateSchema();
  return orm;
};

export const closeORM = async () => {
  await orm.close();
};
