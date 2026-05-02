import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getVaults, searchContacts } from "./api";
import {
  ContactDetails,
  ContractStatus,
  FinanceCategoryType,
  LendingContract,
  Vault,
} from "./entity.interface";

interface LendingContractFormProps {
  contract?: LendingContract | null;
  onSubmit: (data: LendingContract, vaultId?: number) => void;
  onCancel: () => void;
}

const FINANCE_CATEGORIES: FinanceCategoryType[] = [
  "Qard al-Hasan",
  "Zakat",
  "Sadaqa",
  "Waqf",
];

function calcReturnDate(days: number, baseDate?: Date | null): string {
  if (!days || days <= 0) return "";
  const d = baseDate ? new Date(baseDate) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const LendingContractForm = ({
  contract,
  onSubmit,
  onCancel,
}: LendingContractFormProps) => {
  const { t } = useTranslation();
  const [contactQuery, setContactQuery] = useState("");
  const [contactResults, setContactResults] = useState<ContactDetails[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [amount, setAmount] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [financeCategoryType, setFinanceCategoryType] =
    useState<FinanceCategoryType>("Qard al-Hasan");
  const [reasonForLending, setReasonForLending] = useState("");
  const [contractStatus, setContractStatus] =
    useState<ContractStatus>("Active");
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [vaultId, setVaultId] = useState<number | "">("");

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isCreate = !contract;

  useEffect(() => {
    if (isCreate) {
      getVaults().then(setVaults).catch(console.error);
    }
  }, [isCreate]);

  useEffect(() => {
    if (contract) {
      setSelectedContactId(contract.contact.id);
      setContactQuery(contract.contact.name);
      setAmount(String(contract.amount));
      setDurationDays(String(contract.durationDays));
      setReturnDate(contract.returnDate);
      setFinanceCategoryType(contract.financeCategoryType);
      setReasonForLending(contract.reasonForLending ?? "");
      setContractStatus(contract.contractStatus);
    } else {
      resetForm();
    }
  }, [contract]);

  useEffect(() => {
    const days = parseInt(durationDays, 10);
    setReturnDate(calcReturnDate(days, contract?.createdAt));
  }, [durationDays, contract?.createdAt]);

  const handleContactQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setContactQuery(q);
    setSelectedContactId(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.trim().length === 0) {
      setContactResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(() => {
      searchContacts(q.trim())
        .then((results) => {
          setContactResults(results);
          setShowDropdown(true);
        })
        .catch(console.error);
    }, 300);
  };

  const handleSelectContact = (contact: ContactDetails) => {
    setSelectedContactId(contact.id);
    setContactQuery(contact.name);
    setContactResults([]);
    setShowDropdown(false);
  };

  const handleContactBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId) return;
    if (isCreate && vaultId === "") return;

    const data: LendingContract = {
      id: contract?.id ?? (0 as number),
      contact: { id: selectedContactId, name: contactQuery } as ContactDetails,
      amount: parseFloat(amount),
      durationDays: parseInt(durationDays, 10),
      returnDate,
      financeCategoryType,
      reasonForLending,
      contractStatus,
    };
    onSubmit(data, isCreate ? (vaultId as number) : undefined);
    resetForm();
  };

  const resetForm = () => {
    setContactQuery("");
    setContactResults([]);
    setSelectedContactId(null);
    setShowDropdown(false);
    setAmount("");
    setDurationDays("");
    setReturnDate("");
    setFinanceCategoryType("Qard al-Hasan");
    setReasonForLending("");
    setContractStatus("Active");
    setVaultId("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {isCreate && (
          <>
            <div className="flex items-start">
              <label
                className="w-1/3 pt-2 text-sm font-semibold"
                htmlFor="contact"
              >
                {t("common.contact")} *
              </label>
              <div className="relative w-full" ref={dropdownRef}>
                <input
                  type="text"
                  id="contact"
                  value={contactQuery}
                  onChange={handleContactQueryChange}
                  onFocus={() =>
                    contactResults.length > 0 && setShowDropdown(true)
                  }
                  onBlur={handleContactBlur}
                  className="input input-bordered w-full"
                  placeholder={t("common.searchByName")}
                  autoComplete="off"
                  required
                />
                {!selectedContactId && contactQuery.length > 0 && (
                  <span className="text-error mt-1 block text-xs">
                    {t("common.selectContact")}
                  </span>
                )}
                {showDropdown && contactResults.length > 0 && (
                  <ul className="border-base-300 bg-base-100 absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border shadow-lg">
                    {contactResults.map((c) => (
                      <li
                        key={c.id}
                        className="hover:bg-primary hover:text-primary-content cursor-pointer px-4 py-2 text-sm"
                        onMouseDown={() => handleSelectContact(c)}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs opacity-60"> — {c.phone}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {showDropdown &&
                  contactResults.length === 0 &&
                  contactQuery.length > 0 && (
                    <ul className="border-base-300 bg-base-100 absolute z-10 mt-1 w-full rounded-md border shadow-lg">
                      <li className="px-4 py-2 text-sm opacity-60">
                        {t("common.noContactsFound")}
                      </li>
                    </ul>
                  )}
              </div>
            </div>

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
          <label className="w-1/3 pt-2 text-sm font-semibold" htmlFor="reason">
            {t("lendingContracts.reason")}
          </label>
          <textarea
            id="reason"
            value={reasonForLending}
            onChange={(e) => setReasonForLending(e.target.value)}
            className="textarea textarea-bordered w-full"
            rows={3}
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
            {contract ? t("common.update") : t("common.add")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LendingContractForm;
