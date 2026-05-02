import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getBorrowingContracts,
  getLendingContracts,
  getVaults,
  searchContacts,
} from "./api";
import {
  BorrowingContract,
  ContactDetails,
  ExpenseType,
  FinanceCategoryType,
  LendingContract,
  Transaction,
  TransactionType,
  Vault,
} from "./entity.interface";

interface TransactionFormProps {
  onSubmit: (data: Transaction) => void;
  onCancel: () => void;
}

const TRANSACTION_TYPES: TransactionType[] = [
  "LendRepay",
  "BorrowRepay",
  "Expense",
];

const EXPENSE_TYPES: NonNullable<ExpenseType>[] = [
  "Bank Charge",
  "Conveyance",
  "Phone Expenses",
  "Entertainment",
  "Miscellaneous",
  "Legal Expenses",
];

const FINANCE_CATEGORIES: FinanceCategoryType[] = [
  "Qard al-Hasan",
  "Zakat",
  "Sadaqa",
  "Waqf",
];

function needsLendingContract(t: TransactionType) {
  return t === "LendRepay";
}
function needsBorrowingContract(t: TransactionType) {
  return t === "BorrowRepay";
}
function isExpense(t: TransactionType) {
  return t === "Expense";
}
function isRepay(t: TransactionType) {
  return t === "LendRepay" || t === "BorrowRepay";
}

function ExpenseContactSearchField({
  selectedContact,
  onSelect,
}: {
  selectedContact: ContactDetails | null;
  onSelect: (c: ContactDetails | null) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(selectedContact?.name ?? "");
  const [results, setResults] = useState<ContactDetails[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(selectedContact?.name ?? "");
  }, [selectedContact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    onSelect(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.trim().length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(() => {
      searchContacts(q.trim())
        .then((r) => {
          setResults(r);
          setShowDropdown(true);
        })
        .catch(console.error);
    }, 300);
  };

  return (
    <div className="flex items-start">
      <label className="w-1/3 pt-2 text-sm font-semibold">
        {t("common.contact")}
      </label>
      <div className="relative w-full">
        <div className="flex gap-1">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className="input input-bordered w-full"
            placeholder={t("common.searchByName")}
            autoComplete="off"
          />
          {selectedContact && (
            <button
              type="button"
              className="btn btn-ghost btn-square"
              onClick={() => {
                onSelect(null);
                setQuery("");
                setResults([]);
              }}
              tabIndex={-1}
            >
              {t("common.close")}
            </button>
          )}
        </div>
        {showDropdown && results.length > 0 && (
          <ul className="border-base-300 bg-base-100 absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border shadow-lg">
            {results.map((c) => (
              <li
                key={c.id}
                className="hover:bg-primary hover:text-primary-content cursor-pointer px-4 py-2 text-sm"
                onMouseDown={() => {
                  onSelect(c);
                  setQuery(c.name);
                  setResults([]);
                  setShowDropdown(false);
                }}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs opacity-60"> — {c.phone}</span>
              </li>
            ))}
          </ul>
        )}
        {showDropdown && results.length === 0 && query.length > 0 && (
          <ul className="border-base-300 bg-base-100 absolute z-10 mt-1 w-full rounded-md border shadow-lg">
            <li className="px-4 py-2 text-sm opacity-60">
              {t("common.noContactsFound")}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

const TransactionForm = ({ onSubmit, onCancel }: TransactionFormProps) => {
  const { t } = useTranslation();
  const [transactionType, setTransactionType] =
    useState<TransactionType>("LendRepay");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [financeCategoryType, setFinanceCategoryType] =
    useState<FinanceCategoryType>("Qard al-Hasan");
  const [expenseType, setExpenseType] =
    useState<NonNullable<ExpenseType>>("Bank Charge");

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [vaultId, setVaultId] = useState<number | "">("");

  const [lendingContracts, setLendingContracts] = useState<LendingContract[]>(
    [],
  );
  const [borrowingContracts, setBorrowingContracts] = useState<
    BorrowingContract[]
  >([]);
  const [lendingContractId, setLendingContractId] = useState<number | "">("");
  const [borrowingContractId, setBorrowingContractId] = useState<number | "">(
    "",
  );

  const [expenseContact, setExpenseContact] = useState<ContactDetails | null>(
    null,
  );

  useEffect(() => {
    getVaults().then(setVaults).catch(console.error);
    getLendingContracts().then(setLendingContracts).catch(console.error);
    getBorrowingContracts().then(setBorrowingContracts).catch(console.error);
  }, []);

  useEffect(() => {
    setLendingContractId("");
    setBorrowingContractId("");
    setExpenseContact(null);
    setAmount("");
  }, [transactionType]);

  useEffect(() => {
    if (transactionType === "LendRepay" && lendingContractId !== "") {
      const lc = lendingContracts.find((c) => c.id === lendingContractId);
      if (lc) {
        setFinanceCategoryType(lc.financeCategoryType);
        setAmount(String(Math.max(0, lc.amount - (lc.totalRepaid ?? 0))));
      }
    } else if (
      transactionType === "BorrowRepay" &&
      borrowingContractId !== ""
    ) {
      const bc = borrowingContracts.find((c) => c.id === borrowingContractId);
      if (bc) {
        setFinanceCategoryType(bc.financeCategoryType);
        setAmount(String(Math.max(0, bc.amount - (bc.totalRepaid ?? 0))));
      }
    }
  }, [
    transactionType,
    lendingContractId,
    borrowingContractId,
    lendingContracts,
    borrowingContracts,
  ]);

  const repayContractSelected =
    (transactionType === "LendRepay" && lendingContractId !== "") ||
    (transactionType === "BorrowRepay" && borrowingContractId !== "");

  const maxRepayAmount: number | undefined = (() => {
    if (transactionType === "LendRepay" && lendingContractId !== "") {
      const lc = lendingContracts.find((c) => c.id === lendingContractId);
      return lc ? Math.max(0, lc.amount - (lc.totalRepaid ?? 0)) : undefined;
    }
    if (transactionType === "BorrowRepay" && borrowingContractId !== "") {
      const bc = borrowingContracts.find((c) => c.id === borrowingContractId);
      return bc ? Math.max(0, bc.amount - (bc.totalRepaid ?? 0)) : undefined;
    }
    return undefined;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultId === "") return;

    const selectedVault = vaults.find((v) => v.id === vaultId);
    if (!selectedVault) return;

    const data: Transaction = {
      id: 0,
      description,
      amount: parseFloat(amount),
      transactionType,
      vault: selectedVault,
      financeCategoryType,
      balance: 0,
    };

    if (needsLendingContract(transactionType)) {
      if (lendingContractId === "") return;
      const lc = lendingContracts.find((c) => c.id === lendingContractId);
      if (!lc) return;
      data.lendingContract = lc;
    } else if (needsBorrowingContract(transactionType)) {
      if (borrowingContractId === "") return;
      const bc = borrowingContracts.find((c) => c.id === borrowingContractId);
      if (!bc) return;
      data.borrowingContract = bc;
    } else if (isExpense(transactionType)) {
      data.expenseType = expenseType;
      if (expenseContact) data.contact = expenseContact;
    }

    onSubmit(data);
    resetForm();
  };

  const resetForm = () => {
    setTransactionType("LendRepay");
    setAmount("");
    setDescription("");
    setFinanceCategoryType("Qard al-Hasan");
    setExpenseType("Bank Charge");
    setVaultId("");
    setLendingContractId("");
    setBorrowingContractId("");
    setExpenseContact(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex items-center">
          <label className="w-1/3 text-sm font-semibold" htmlFor="txType">
            {t("transactions.type")} *
          </label>
          <select
            id="txType"
            value={transactionType}
            onChange={(e) =>
              setTransactionType(e.target.value as TransactionType)
            }
            className="select select-bordered w-full"
            required
          >
            {TRANSACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`transactionType.${type}`)}
              </option>
            ))}
          </select>
        </div>

        {needsLendingContract(transactionType) && (
          <div className="flex items-center">
            <label
              className="w-1/3 text-sm font-semibold"
              htmlFor="lendingContract"
            >
              {t("transactions.lendingContract")} *
            </label>
            <select
              id="lendingContract"
              value={lendingContractId}
              onChange={(e) =>
                setLendingContractId(
                  e.target.value === "" ? "" : parseInt(e.target.value),
                )
              }
              className="select select-bordered w-full"
              required
            >
              <option value="">
                {t("transactions.selectLendingContract")}
              </option>
              {lendingContracts
                .filter((c) => c.contractStatus === "Active")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} — {c.contact.name} —{" "}
                    {t(`financeCategory.${c.financeCategoryType}`)} (
                    {c.amount.toLocaleString()})
                  </option>
                ))}
            </select>
          </div>
        )}

        {needsBorrowingContract(transactionType) && (
          <div className="flex items-center">
            <label
              className="w-1/3 text-sm font-semibold"
              htmlFor="borrowingContract"
            >
              {t("transactions.borrowingContract")} *
            </label>
            <select
              id="borrowingContract"
              value={borrowingContractId}
              onChange={(e) =>
                setBorrowingContractId(
                  e.target.value === "" ? "" : parseInt(e.target.value),
                )
              }
              className="select select-bordered w-full"
              required
            >
              <option value="">
                {t("transactions.selectBorrowingContract")}
              </option>
              {borrowingContracts
                .filter((c) => c.contractStatus === "Active")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} — {c.contact.name} —{" "}
                    {t(`financeCategory.${c.financeCategoryType}`)} (
                    {c.amount.toLocaleString()})
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="flex items-center">
          <label className="w-1/3 text-sm font-semibold" htmlFor="financeCat">
            {t("common.category")} *
          </label>
          {isRepay(transactionType) ? (
            <input
              id="financeCat"
              type="text"
              value={
                repayContractSelected
                  ? t(`financeCategory.${financeCategoryType}`)
                  : ""
              }
              readOnly
              placeholder={t("transactions.selectContractFirst")}
              className="input input-bordered w-full cursor-not-allowed opacity-60"
              tabIndex={-1}
            />
          ) : (
            <select
              id="financeCat"
              value={financeCategoryType}
              onChange={(e) =>
                setFinanceCategoryType(e.target.value as FinanceCategoryType)
              }
              className="select select-bordered w-full"
              required
            >
              {FINANCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`financeCategory.${c}`)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center">
          <label className="w-1/3 text-sm font-semibold" htmlFor="vault">
            {t("common.vault")} *
          </label>
          <select
            id="vault"
            value={vaultId}
            onChange={(e) =>
              setVaultId(e.target.value === "" ? "" : parseInt(e.target.value))
            }
            className="select select-bordered w-full"
            required
          >
            <option value="">{t("common.selectVault")}</option>
            {vaults.map((v) => (
              <option key={v.id} value={v.id}>
                #{v.id} — {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <label className="w-1/3 text-sm font-semibold" htmlFor="amount">
            {t("common.amount")} *
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input input-bordered w-full"
            min="0"
            max={maxRepayAmount}
            step="0.01"
            required
          />
        </div>

        {isExpense(transactionType) && (
          <>
            <div className="flex items-center">
              <label
                className="w-1/3 text-sm font-semibold"
                htmlFor="expenseType"
              >
                {t("transactions.expenseType")} *
              </label>
              <select
                id="expenseType"
                value={expenseType}
                onChange={(e) =>
                  setExpenseType(e.target.value as NonNullable<ExpenseType>)
                }
                className="select select-bordered w-full"
                required
              >
                {EXPENSE_TYPES.map((et) => (
                  <option key={et} value={et}>
                    {t(`expenseType.${et}`)}
                  </option>
                ))}
              </select>
            </div>

            <ExpenseContactSearchField
              selectedContact={expenseContact}
              onSelect={setExpenseContact}
            />
          </>
        )}

        <div className="flex items-start">
          <label
            className="w-1/3 pt-2 text-sm font-semibold"
            htmlFor="description"
          >
            {t("common.description")} *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
            rows={3}
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-neutral btn-outline"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </button>
          <button type="submit" className="btn btn-primary btn-outline">
            {t("common.add")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TransactionForm;
