import { Migrator } from "@mikro-orm/migrations";
import { Options, SqliteDriver } from "@mikro-orm/sqlite";
import { app } from "electron";
import path from "path";

import { Migration20260524190632 } from "./migrations/Migration20260524190632.js";
import { AuditSubscriber } from "./repository/audit-subscriber.js";
import { AuditLog } from "./repository/entity/audit-log.js";
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
    AuditLog,
    BorrowingContract,
    ContactDetails,
    LendingContract,
    Transaction,
    Vault,
    VaultBalanceHistory,
  ],
  subscribers: [new AuditSubscriber()],
  extensions: [Migrator],
  migrations: {
    // Static list avoids filesystem globbing, which is broken inside an
    // Electron asar archive (fs.globSync returns undefined and throws error).
    migrationsList: [Migration20260524190632],
    pathTs: "./src/migrations", // required for mikro-orm cli to find the TS source files when generating new migrations
    snapshot: app.isPackaged ? false : true, // snapshotting shouldn't be used in production, as we use it in dev to generate migration
  },
  debug: true,
};

export default config;
