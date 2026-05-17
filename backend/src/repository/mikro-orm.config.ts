import path from "path";
import { Options, SqliteDriver } from "@mikro-orm/sqlite";

import { BorrowingContract } from "./entity/borrowing-contract.js";
import { ContactDetails } from "./entity/contact-details.js";
import { LendingContract } from "./entity/lending-contract.js";
import { Transaction } from "./entity/transaction.js";
import { Vault } from "./entity/vault.js";
import { VaultBalanceHistory } from "./entity/vault-balance-history.js";

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
  debug: true,
};

export default config;
