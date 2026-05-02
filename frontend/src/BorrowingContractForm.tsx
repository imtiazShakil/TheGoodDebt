import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getVaults, searchContacts } from "./api";
import {
  BorrowingContract,
  ContactDetails,
  ContractStatus,
  FinanceCategoryType,
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
            placeholder={t("common.searchByName")}
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
              {t("common.close")}
            </button>
          )}
        </div>
        {required && !selectedContact && query.length > 0 && (
          <span className="text-error mt-1 block text-xs">
            {t("common.selectContact")}
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
            <li className="px-4 py-2 text-sm opacity-60">
              {t("common.noContactsFound")}
            </li>
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
  const { t } = useTranslation();
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
  const [firstReminder, setFirstReminder] = useState("");
  const [secondReminder, setSecondReminder] = useState("");
  const [thirdReminder, setThirdReminder] = useState("");
  const [guarantorsReminder, setGuarantorsReminder] = useState("");
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
      setReturnDate(contract.returnDate);
      setFinanceCategoryType(contract.financeCategoryType);
      setPurposeOfLoan(contract.purposeOfLoan ?? "");
      setFirstReminder(contract.firstReminder ?? "");
      setSecondReminder(contract.secondReminder ?? "");
      setThirdReminder(contract.thirdReminder ?? "");
      setGuarantorsReminder(contract.guarantorsReminder ?? "");
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
      firstReminder: firstReminder || undefined,
      secondReminder: secondReminder || undefined,
      thirdReminder: thirdReminder || undefined,
      guarantorsReminder: guarantorsReminder || undefined,
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
    setFirstReminder("");
    setSecondReminder("");
    setThirdReminder("");
    setGuarantorsReminder("");
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
              label={`${t("common.contact")} *`}
              required
              selectedContact={selectedContact}
              onSelect={setSelectedContact}
            />

            <div className="flex items-center">
              <label
                className="w-1/3 text-sm font-semibold"
                htmlFor="financeCategory"
              >
                {t("common.category")} *
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
                    {t(`financeCategory.${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-1/3 text-sm font-semibold" htmlFor="amount">
                {t("common.amount")} *
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
            {t("common.durationDays")} *
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
            {t("common.returnDate")}
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
              {t("common.vault")} *
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
              <option value="">{t("common.selectVault")}</option>
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
            {t("borrowingContracts.purposeOfLoan")}
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
              label={t("borrowingContracts.guarantor1")}
              selectedContact={selectedGuarantor1}
              onSelect={setSelectedGuarantor1}
            />

            <ContactSearchField
              id="guarantor2"
              label={t("borrowingContracts.guarantor2")}
              selectedContact={selectedGuarantor2}
              onSelect={setSelectedGuarantor2}
            />
          </>
        )}

        {!isCreate &&
          [
            {
              id: "firstReminder",
              label: t("borrowingContracts.firstReminder"),
              value: firstReminder,
              set: setFirstReminder,
            },
            {
              id: "secondReminder",
              label: t("borrowingContracts.secondReminder"),
              value: secondReminder,
              set: setSecondReminder,
            },
            {
              id: "thirdReminder",
              label: t("borrowingContracts.thirdReminder"),
              value: thirdReminder,
              set: setThirdReminder,
            },
            {
              id: "guarantorsReminder",
              label: t("borrowingContracts.guarantorsReminder"),
              value: guarantorsReminder,
              set: setGuarantorsReminder,
            },
          ].map(({ id, label, value, set }) => (
            <div key={id} className="flex items-center">
              <label className="w-1/3 text-sm font-semibold" htmlFor={id}>
                {label}
              </label>
              <input
                type="date"
                id={id}
                value={value}
                onChange={(e) => set(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
          ))}

        {!isCreate && (
          <div className="flex items-center">
            <label
              className="w-1/3 text-sm font-semibold"
              htmlFor="adjustmentTxId"
            >
              {t("borrowingContracts.adjTransactionId")}
            </label>
            <input
              type="number"
              id="adjustmentTxId"
              value={adjustmentWithTransactionId}
              onChange={(e) => setAdjustmentWithTransactionId(e.target.value)}
              className="input input-bordered w-full"
              min="1"
              placeholder={t("common.optional")}
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-neutral btn-outline"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </button>
          <button type="submit" className="btn btn-primary btn-outline">
            {contract ? t("common.update") : t("common.add")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BorrowingContractForm;
