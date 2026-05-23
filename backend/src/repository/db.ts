import { MikroORM } from "@mikro-orm/sqlite";
import config from "../mikro-orm.config.js";

export let orm: MikroORM;

/** Initializes MikroORM and applies any pending migrations. */
export const initORM = async () => {
  orm = await MikroORM.init(config);
  await orm.migrator.up();
  return orm;
};

/** Closes the ORM connection gracefully on app shutdown. */
export const closeORM = async () => {
  await orm.close();
};
