# The Good Debt

A desktop application for managing interest-free (halal) community finance. It lets a fund manager track money coming in from lenders, money going out as loans to borrowers, and operational expenses — all categorised by Islamic finance type.

The name reflects the Islamic concept that a good debt is an interest-free loan given to someone in need, with only the principal returned at the end.

## What it does

- **Vaults** — physical or logical funds (e.g. a masjid's operating fund). Each vault tracks four separate balance buckets:
  - _Qard al-Hasan_ — benevolent interest-free loans
  - _Zakat_ — obligatory annual charity
  - _Sadaqa_ — voluntary charity
  - _Waqf_ — endowment / charitable trust
- **Lending Contracts** — when someone lends money _to_ the fund, a contract is created and an automatic `Lend` transaction is recorded against the chosen vault/category
- **Borrowing Contracts** — when the fund gives a loan _out_ to a borrower, a contract is created and a `Borrow` transaction is recorded. Up to two guarantors can be attached. The fund validates that the vault has sufficient balance in the relevant category before the contract is saved.
- **Transactions** — append-only ledger. Every transaction (Lend, Borrow, LendRepay, BorrowRepay, Expense) produces a `VaultBalanceHistory` snapshot recording the per-category running balances at that point in time.
- **Contacts** — people or entities involved in contracts and transactions, with support for blacklisting.

### Key business rules

- `Lend` and `Borrow` transactions are created automatically when their contracts are saved. They cannot be created manually.
- Repayment transactions (`LendRepay`, `BorrowRepay`) inherit the finance category from the originating contract — the user cannot change it.
- Only the most recent transaction can be deleted. Deleting it also removes the linked `VaultBalanceHistory` row. If the transaction belongs to a contract, the contract is deleted too, and vice-versa.
- A vault cannot be deleted if it has any transaction history.

## Tech stack

| Layer                  | Technology                                           |
| ---------------------- | ---------------------------------------------------- |
| Desktop shell          | Electron                                             |
| Frontend               | React 19, TypeScript, Vite, Tailwind CSS v4, DaisyUI |
| Backend (main process) | TypeScript, MikroORM v7, SQLite                      |
| i18n                   | i18next (English and Bengali)                        |
| Icons                  | Phosphor Icons                                       |
| Notifications          | Sonner                                               |

The frontend runs as a Vite dev server (or built bundle) inside an Electron BrowserWindow. The backend runs in Electron's main process and exposes IPC handlers. Communication between the two happens via a typed `window.electron` bridge defined in `preload.ts`.

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Backend

```shell
cd backend
npm install
npm start        # compiles TypeScript then launches Electron
```

### Frontend

```shell
cd frontend
npm install
npm run dev      # Vite dev server at http://localhost:5173
```

Open both in separate terminals. Electron loads the Vite dev server URL in development.

### Database migrations

Schema is versioned with MikroORM migrations under `backend/src/migrations/`. The app applies any pending migrations automatically on startup (`orm.migrator.up()` in `db.ts`); you only invoke the CLI when generating or inspecting migrations.

`better-sqlite3` is a native module that must be compiled against whichever runtime loads it. The `postinstall` step compiles it for Electron's ABI so the app can run, but plain `node` (which the CLI uses) needs the system-Node ABI. Switch builds before/after using the CLI. Run all commands from `backend/`.

| Action | Command |
|--------|---------|
| Switch native build to **system Node** (before CLI use) | `npm rebuild better-sqlite3` |
| Generate a migration from entity diffs | `npx mikro-orm migration:create` |
| Generate the initial migration (empty DB only) | `npx mikro-orm migration:create --initial` |
| Drop everything and rebuild | `npx mikro-orm migration:fresh` |
| Switch native build back to **Electron** (before `npm start`) | `npm run postinstall` |

Workflow when changing the schema:
1. `npm rebuild better-sqlite3` — switch the native build to system Node.
2. Edit an entity under `backend/src/repository/entity/`.
3. `npx mikro-orm migration:create` — review the generated SQL in `backend/src/migrations/`.
4. `npm run postinstall` — switch the native build back to Electron before running the app.
5. Commit the entity change and the migration file together. Never edit a migration once it's committed — write a new one to fix it.

### Production build

```shell
cd frontend && npm run build   # output goes to frontend/dist
cd backend && npm start        # Electron serves the built frontend
```

## Project structure

```
TheGoodDebt/
├── backend/
│   └── src/
│       ├── ipc/               # Electron IPC handlers (register-*.ts)
│       ├── repository/
│       │   ├── entity/        # MikroORM entities
│       │   ├── db.ts          # ORM initialisation
│       │   └── seed.ts        # Demo data
│       ├── main.ts            # Electron entry point
│       └── preload.ts         # Context bridge
└── frontend/
    └── src/
        ├── i18n/locales/      # en.json, bn.json
        ├── api.ts             # IPC call wrappers
        ├── entity.interface.d.ts
        └── *Component.tsx     # One component per entity
```

## License

GPL-3.0 — see [LICENSE](LICENSE).
