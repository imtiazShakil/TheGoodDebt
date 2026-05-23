import { Migrator } from "@mikro-orm/migrations";
import { Options, SqliteDriver } from "@mikro-orm/sqlite";
import path from "path";
import { fileURLToPath } from "url";

import { BorrowingContract } from "./repository/entity/borrowing-contract.js";
import { ContactDetails } from "./repository/entity/contact-details.js";
import { LendingContract } from "./repository/entity/lending-contract.js";
import { Transaction } from "./repository/entity/transaction.js";
import { VaultBalanceHistory } from "./repository/entity/vault-balance-history.js";
import { Vault } from "./repository/entity/vault.js";

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
    // Anchored to this file's own directory (not cwd) so the same expression
    // works everywhere the config is loaded from:
    //   - CLI (tsx loads the .ts) → src/migrations/   (TS sources)
    //   - npm start (loads the .js in dist/) → dist/migrations/   (compiled)
    //   - packaged AppImage → resources/app/dist/migrations/   (compiled)
    path: path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations"),
  },
  debug: true,
};

export default config;
