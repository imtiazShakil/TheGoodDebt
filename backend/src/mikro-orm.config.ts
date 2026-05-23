import path from "path";
import { Options, SqliteDriver } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";

import { BorrowingContract } from "./repository/entity/borrowing-contract.js";
import { ContactDetails } from "./repository/entity/contact-details.js";
import { LendingContract } from "./repository/entity/lending-contract.js";
import { Transaction } from "./repository/entity/transaction.js";
import { Vault } from "./repository/entity/vault.js";
import { VaultBalanceHistory } from "./repository/entity/vault-balance-history.js";

const getDbPath = (): string => {
  const dbFile = "tgd.sqlite";
  if (process.env.APPIMAGE)
    return path.join(path.dirname(process.env.APPIMAGE), dbFile);
  if (process.env.PORTABLE_EXECUTABLE_DIR)
    return path.join(process.env.PORTABLE_EXECUTABLE_DIR, dbFile);
  return dbFile;
};

const config: Options = {
  driver: SqliteDriver,
  dbName: getDbPath(),
  entities: [
    BorrowingContract,
    ContactDetails,
    LendingContract,
    Transaction,
    Vault,
    VaultBalanceHistory,
  ],
  extensions: [Migrator],
  migrations: {
    path: "./dist/migrations",
    pathTs: "./src/migrations",
  },
  debug: true,
};

export default config;
