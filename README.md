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
| Backend (main process) | TypeScript, MikroORM v6, SQLite                      |
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
