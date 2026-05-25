<p align="center">
  <img src="backend/build/icon.png" alt="The Good Debt logo" width="128" />
</p>

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
- **Borrowing Contracts** — when the fund gives a loan _out_ to a borrower, a contract is created and a `Borrow` transaction is recorded. Up to two guarantors can be attached, and four reminder dates (1st, 2nd, 3rd, and guarantors reminder) can be set to track follow-ups. The fund validates that the vault has sufficient balance in the relevant category before the contract is saved.
- **Transactions** — append-only ledger. Every transaction (Lend, Borrow, LendRepay, BorrowRepay, Expense) produces a `VaultBalanceHistory` snapshot recording the per-category running balances at that point in time.
- **Contacts** — people or entities involved in contracts and transactions, with support for blacklisting.
- **Contract attachments** — each lending or borrowing contract can carry a single supporting file (PDF, JPG, PNG, WEBP, or ZIP; up to 5 MB) that can be uploaded and later downloaded.
- **Printable agreements** — contracts can be rendered to a print-ready agreement, in English or Bengali.

### Key business rules

- `Lend` and `Borrow` transactions are created automatically when their contracts are saved. They cannot be created manually.
- Repayment transactions (`LendRepay`, `BorrowRepay`) inherit the finance category from the originating contract — the user cannot change it.
- Only the most recent transaction can be deleted. Deleting it also removes the linked `VaultBalanceHistory` row. If the transaction belongs to a contract, the contract is deleted too, and vice-versa.
- A vault cannot be deleted if it has any transaction history.

## Tech stack

| Layer                  | Technology                                           |
| ---------------------- | ---------------------------------------------------- |
| Desktop shell          | Electron 39                                          |
| Frontend               | React 19, TypeScript, Vite, Tailwind CSS v4, DaisyUI |
| Backend (main process) | TypeScript, MikroORM v7, SQLite                      |
| i18n                   | i18next (English and Bengali)                        |
| Icons                  | Phosphor Icons                                       |
| Notifications          | Sonner                                               |
| Packaging              | electron-builder (Windows portable `.exe`, Linux AppImage) |

The frontend runs as a Vite dev server (or built bundle) inside an Electron BrowserWindow. The backend runs in Electron's main process and exposes IPC handlers. Communication between the two happens via a typed `window.electron` bridge defined in `preload.ts`.

## Getting started

### Prerequisites

- Node.js 22.x (>=22, <24)
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

The `postinstall` step (`electron-builder install-app-deps`) compiles native deps (notably the SQLite driver) for Electron's ABI so the app can run. The mikro-orm CLI runs under plain Node and needs the system-Node ABI — run `npm rebuild` before invoking the CLI, then `npm run postinstall` to switch back before `npm start`. Run all commands from `backend/`.

Workflow when changing the schema:
1. `npm rebuild` — switch the native build to system Node.
2. Edit an entity under `backend/src/repository/entity/`.
3. `npx mikro-orm migration:create` — review the generated SQL in `backend/src/migrations/`.
4. `npm run postinstall` — switch the native build back to Electron before running the app.
5. Commit the entity change and the migration file together. Never edit a migration once it's committed — write a new one to fix it.

### Build & distribution

From `backend/`:

```shell
npm run build    # builds the frontend (frontend/dist) and the backend (dist)
npm start        # launches Electron against the built frontend
```

`npm run dist` (also from `backend/`) runs electron-builder and produces a Windows portable `.exe` or a Linux AppImage under `release/`. A manually-triggered GitHub Actions workflow at `.github/workflows/build-dist.yml` runs the same on CI for both platforms and uploads the artefacts.

## Project structure

```
TheGoodDebt/
├── backend/    # Electron main process + MikroORM/SQLite backend
└── frontend/   # React + Vite renderer
```

## License

GPL-3.0 — see [LICENSE](LICENSE).
