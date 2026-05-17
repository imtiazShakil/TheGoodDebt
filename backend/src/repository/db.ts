import { MikroORM } from "@mikro-orm/sqlite";
import config from "./mikro-orm.config.js";

export let orm: MikroORM;

/** Initializes MikroORM with the SQLite driver and runs a schema sync to apply any pending changes. */
export const initORM = async () => {
  orm = await MikroORM.init(config);
  await orm.schema.update();
  return orm;
};

/** Closes the ORM connection gracefully on app shutdown. */
export const closeORM = async () => {
  await orm.close();
};
