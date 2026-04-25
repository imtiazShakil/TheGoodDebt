import React, { useEffect, useRef, useState } from "react";
import { getVaults, searchContacts } from "./api";
import {
  BorrowingContract,
  ContactDetails,
  ContractStatus,
  FinanceCategoryType,
  LoanRecallStatus,
  Vault,
} from "./entity.interface";

interface BorrowingContractFormProps {
  contract?: BorrowingContract | null;
  onSubmit: (data: BorrowingContract, vaultId?: number) => void;
  onCancel: () => void;
}

const FINANCE_CATEGORIES: FinanceCategoryType[] = [
  "Qard al-Hasan",
  "Zakat",
  "Sadaqa",
  "Waqf",
];

const LOAN_RECALL_STATUSES: NonNullable<LoanRecallStatus>[] = [
  "1st Reminder",
  "2nd Reminder",
  "3rd Reminder",
  "Guarantors reminder",
];

function calcReturnDate(days: number): string {
  if (!days || days <= 0) return "";
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

interface ContactSearchFieldProps {
  id: string;
  label: string;
  required?: boolean;
  selectedContact: ContactDetails | null;
  onSelect: (contact: ContactDetails | null) => void;
}

function ContactSearchField({
  id,
  label,
  required = false,
  selectedContact,
  onSelect,
}: ContactSearchFieldProps) {
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

  const handleSelect = (contact: ContactDetails) => {
    onSelect(contact);
    setQuery(contact.name);
    setResults([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  return (
    <div className="flex items-start">
      <label className="w-1/3 pt-2 text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <div className="relative w-full">
        <div className="flex gap-1">
          <input
            type="text"
            id={id}
            value={query}
            onChange={handleChange}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            onBlur={handleBlur}
            className="input input-bordered w-full"
            placeholder="Search by name…"
            autoComplete="off"
            required={required}
          />
          {selectedContact && (
            <button
              type="button"
              className="btn btn-ghost btn-square"
              onClick={handleClear}
              tabIndex={-1}
            >
              ✕
            </button>
          )}
        </div>
        {required && !selectedContact && query.length > 0 && (
          <span className="text-error mt-1 block text-xs">
            Please select a contact from the list
          </span>
        )}
        {showDropdown && results.length > 0 && (
          <ul className="border-base-300 bg-base-100 absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border shadow-lg">
            {results.map((c) => (
              <li
                key={c.id}
                className="hover:bg-primary hover:text-primary-content cursor-pointer px-4 py-2 text-sm"
                onMouseDown={() => handleSelect(c)}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs opacity-60"> — {c.phone}</span>
              </li>
            ))}
          </ul>
        )}
        {showDropdown && results.length === 0 && query.length > 0 && (
          <ul className="border-base-300 bg-base-100 absolute z-10 mt-1 w-full rounded-md border shadow-lg">
            <li className="px-4 py-2 text-sm opacity-60">No contacts found</li>
          </ul>
        )}
      </div>
    </div>
  );
}

const BorrowingContractForm = ({
  contract,
  onSubmit,
  onCancel,
}: BorrowingContractFormProps) => {
  const [selectedContact, setSelectedContact] = useState<ContactDetails | null>(
    null,
  );
  const [selectedGuarantor1, setSelectedGuarantor1] =
    useState<ContactDetails | null>(null);
  const [selectedGuarantor2, setSelectedGuarantor2] =
    useState<ContactDetails | null>(null);
  const [amount, setAmount] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [financeCategoryType, setFinanceCategoryType] =
    useState<FinanceCategoryType>("Qard al-Hasan");
  const [purposeOfLoan, setPurposeOfLoan] = useState("");
  const [loanRecallStatus, setLoanRecallStatus] = useState<
    NonNullable<LoanRecallStatus> | ""
  >("");
  const [contractStatus, setContractStatus] =
    useState<ContractStatus>("Active");
  const [adjustmentWithTransactionId, setAdjustmentWithTransactionId] =
    useState("");
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [vaultId, setVaultId] = useState<number | "">("");

  const isCreate = !contract;

  useEffect(() => {
    if (isCreate) {
      getVaults().then(setVaults).catch(console.error);
    }
  }, [isCreate]);

  useEffect(() => {
    if (contract) {
      setSelectedContact(contract.contact);
      setSelectedGuarantor1(contract.guarantor1 ?? null);
      setSelectedGuarantor2(contract.guarantor2 ?? null);
      setAmount(String(contract.amount));
      setDurationDays(String(contract.durationDays));
      setReturnDate(contract.returnDate.split("T")[0]);
      setFinanceCategoryType(contract.financeCategoryType);
      setPurposeOfLoan(contract.purposeOfLoan ?? "");
      setLoanRecallStatus(contract.loanRecallStatus ?? "");
      setContractStatus(contract.contractStatus);
      setAdjustmentWithTransactionId(
        contract.adjustmentWithTransactionId
          ? String(contract.adjustmentWithTransactionId)
          : "",
      );
    } else {
      resetForm();
    }
  }, [contract]);

  useEffect(() => {
    const days = parseInt(durationDays, 10);
    setReturnDate(calcReturnDate(days));
  }, [durationDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;
    if (isCreate && vaultId === "") return;

    const data: BorrowingContract = {
      id: contract?.id ?? (0 as number),
      contact: selectedContact,
      amount: parseFloat(amount),
      durationDays: parseInt(durationDays, 10),
      returnDate,
      financeCategoryType,
      purposeOfLoan,
      guarantor1: selectedGuarantor1 ?? undefined,
      guarantor2: selectedGuarantor2 ?? undefined,
      loanRecallStatus: loanRecallStatus || undefined,
      contractStatus,
      adjustmentWithTransactionId: adjustmentWithTransactionId
        ? parseInt(adjustmentWithTransactionId, 10)
        : undefined,
    };
    onSubmit(data, isCreate ? (vaultId as number) : undefined);
    resetForm();
  };

  const resetForm = () => {
    setSelectedContact(null);
    setSelectedGuarantor1(null);
    setSelectedGuarantor2(null);
    setAmount("");
    setDurationDays("");
    setReturnDate("");
    setFinanceCategoryType("Qard al-Hasan");
    setPurposeOfLoan("");
    setLoanRecallStatus("");
    setContractStatus("Active");
    setAdjustmentWithTransactionId("");
    setVaultId("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {isCreate && (
          <>
            <ContactSearchField
              id="contact"
              label="Contact *"
              required
              selectedContact={selectedContact}
              onSelect={setSelectedContact}
            />

            <div className="flex items-center">
              <label
                className="w-1/3 text-sm font-semibold"
                htmlFor="financeCategory"
              >
                Category *
              </label>
              <select
                id="financeCategory"
                value={financeCategoryType}
                onChange={(e) =>
                  setFinanceCategoryType(e.target.value as FinanceCategoryType)
                }
                className="select select-bordered w-full"
                required
              >
                {FINANCE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-1/3 text-sm font-semibold" htmlFor="amount">
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input input-bordered w-full"
                min="0"
                step="0.01"
                required
              />
            </div>
          </>
        )}

        <div className="flex items-center">
          <label className="w-1/3 text-sm font-semibold" htmlFor="durationDays">
            Duration (days) *
          </label>
          <input
            type="number"
            id="durationDays"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className="input input-bordered w-full"
            min="1"
            required
          />
        </div>

        <div className="flex items-center">
          <label className="w-1/3 text-sm font-semibold" htmlFor="returnDate">
            Return Date
          </label>
          <input
            type="date"
            id="returnDate"
            value={returnDate}
            readOnly
            className="input input-bordered w-full cursor-not-allowed opacity-60"
            tabIndex={-1}
          />
        </div>

        {isCreate && (
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-semibold" htmlFor="vault">
              Vault *
            </label>
            <select
              id="vault"
              value={vaultId}
              onChange={(e) =>
                setVaultId(
                  e.target.value === "" ? "" : parseInt(e.target.value, 10),
                )
              }
              className="select select-bordered w-full"
              required
            >
              <option value="">— Select vault —</option>
              {vaults.map((v) => (
                <option key={v.id} value={v.id}>
                  #{v.id} — {v.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-start">
          <label
            className="w-1/3 pt-2 text-sm font-semibold"
            htmlFor="purposeOfLoan"
          >
            Purpose of Loan
          </label>
          <textarea
            id="purposeOfLoan"
            value={purposeOfLoan}
            onChange={(e) => setPurposeOfLoan(e.target.value)}
            className="textarea textarea-bordered w-full"
            rows={3}
          />
        </div>

        {isCreate && (
          <>
            <ContactSearchField
              id="guarantor1"
              label="Guarantor 1"
              selectedContact={selectedGuarantor1}
              onSelect={setSelectedGuarantor1}
            />

            <ContactSearchField
              id="guarantor2"
              label="Guarantor 2"
              selectedContact={selectedGuarantor2}
              onSelect={setSelectedGuarantor2}
            />

            <div className="flex items-center">
              <label
                className="w-1/3 text-sm font-semibold"
                htmlFor="loanRecallStatus"
              >
                Recall Status
              </label>
              <select
                id="loanRecallStatus"
                value={loanRecallStatus}
                onChange={(e) =>
                  setLoanRecallStatus(
                    e.target.value as NonNullable<LoanRecallStatus> | "",
                  )
                }
                className="select select-bordered w-full"
              >
                <option value="">— None —</option>
                {LOAN_RECALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label
                className="w-1/3 text-sm font-semibold"
                htmlFor="adjustmentTxId"
              >
                Adj. Transaction ID
              </label>
              <input
                type="number"
                id="adjustmentTxId"
                value={adjustmentWithTransactionId}
                onChange={(e) => setAdjustmentWithTransactionId(e.target.value)}
                className="input input-bordered w-full"
                min="1"
                placeholder="Optional"
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-neutral btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-outline">
            {contract ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BorrowingContractForm;
