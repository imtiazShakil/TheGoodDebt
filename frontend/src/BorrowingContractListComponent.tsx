import { HandDeposit, PencilSimple, Trash } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  addBorrowingContract,
  deleteBorrowingContract,
  editBorrowingContract,
  getBorrowingContracts,
} from "./api";
import BorrowingContractForm from "./BorrowingContractForm";
import { BorrowingContract } from "./entity.interface";

const STATUS_BADGE: Record<string, string> = {
  Active: "badge-success",
  Completed: "badge-info",
  Defaulted: "badge-error",
};

function guarantorNames(contract: BorrowingContract): string {
  const names = [contract.guarantor1?.name, contract.guarantor2?.name].filter(
    Boolean,
  );
  return names.length > 0 ? names.join(", ") : "—";
}

function BorrowingContractListComponent() {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<BorrowingContract[]>([]);
  const [selectedContract, setSelectedContract] =
    useState<BorrowingContract | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    getBorrowingContracts()
      .then(setContracts)
      .catch((err) => console.error("Error fetching borrowing contracts", err));
  }, []);

  const handleAdd = useCallback(() => {
    setSelectedContract(() => {
      modalRef.current?.showModal();
      return null;
    });
  }, []);

  const handleEdit = useCallback((contract: BorrowingContract) => {
    setSelectedContract(contract);
    modalRef.current?.showModal();
  }, []);

  const handleDelete = useCallback(
    (contract: BorrowingContract) => {
      if (!confirm(t("borrowingContracts.deleteConfirm", { id: contract.id })))
        return;
      deleteBorrowingContract(contract.id)
        .then((result) => {
          if (!result) return;
          setContracts((prev) => prev.filter((c) => c.id !== contract.id));
          toast.success(t("borrowingContracts.deleted"));
        })
        .catch((err) => {
          console.error("Error deleting borrowing contract", err);
          err?.code
            ? toast.error(t(err.code, err.values))
            : toast.error(t("borrowingContracts.failedToDelete"), {
                description: err?.message,
              });
        });
    },
    [t],
  );

  const handleFormSubmit = (data: BorrowingContract, vaultId?: number) => {
    if (data.id) {
      editBorrowingContract(data)
        .then((contract) => {
          if (!contract) return;
          setContracts((prev) =>
            prev.map((c) => (c.id === contract.id ? contract : c)),
          );
          toast.success(t("borrowingContracts.updated"));
        })
        .catch((err) => {
          console.error("Error editing borrowing contract", err);
          err?.code
            ? toast.error(t(err.code, err.values))
            : toast.error(t("borrowingContracts.failedToUpdate"));
        })
        .finally(() => modalRef.current?.close());
    } else {
      if (vaultId === undefined) return;
      addBorrowingContract(data, vaultId)
        .then((contract) => {
          if (!contract) return;
          setContracts((prev) => [...prev, contract]);
          toast.success(t("borrowingContracts.added"));
        })
        .catch((err) => {
          console.error("Error adding borrowing contract", err);
          err?.code
            ? toast.error(t(err.code, err.values))
            : toast.error(t("borrowingContracts.failedToAdd"), {
                description: err?.message,
              });
        })
        .finally(() => modalRef.current?.close());
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <h2 className="shadow-secondary mb-3 text-3xl font-bold underline shadow-xl ring-4">
          {t("borrowingContracts.title")}
        </h2>
        <button className="btn btn-soft btn-primary" onClick={handleAdd}>
          {t("borrowingContracts.addContract")}
          <HandDeposit size={24} />
        </button>
      </div>

      <div className="my-2 overflow-auto ring-1">
        <table className="table-pin-rows table">
          <thead>
            <tr>
              <th>{t("common.id")}</th>
              <th>{t("common.contact")}</th>
              <th>{t("common.amount")}</th>
              <th>{t("common.duration")}</th>
              <th>{t("common.returnDate")}</th>
              <th>{t("common.category")}</th>
              <th>{t("borrowingContracts.guarantors")}</th>
              <th>{t("common.status")}</th>
              <th>{t("common.repaid")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr
                key={contract.id}
                className="hover:bg-primary hover:text-primary-content transition-colors"
              >
                <td>{contract.id}</td>
                <td>{contract.contact.name}</td>
                <td>{contract.amount.toLocaleString()}</td>
                <td>{contract.durationDays}d</td>
                <td>{new Date(contract.returnDate).toLocaleDateString()}</td>
                <td>{t(`financeCategory.${contract.financeCategoryType}`)}</td>
                <td>{guarantorNames(contract)}</td>
                <td>
                  <span
                    className={`badge badge-sm ${STATUS_BADGE[contract.contractStatus] ?? ""}`}
                  >
                    {t(`contractStatus.${contract.contractStatus}`)}
                  </span>
                </td>
                <td>{(contract.totalRepaid ?? 0).toLocaleString()}</td>
                <td className="flex gap-1">
                  <button
                    className="btn btn-ghost btn-circle"
                    onClick={() => handleEdit(contract)}
                  >
                    <PencilSimple size={24} />
                  </button>
                  <button
                    className="btn btn-ghost btn-circle text-error"
                    onClick={() => handleDelete(contract)}
                  >
                    <Trash size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-2xl">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
              onClick={() => setSelectedContract(null)}
            >
              {t("common.close")}
            </button>
          </form>
          <h2 className="mb-4 text-2xl font-bold">
            {t("borrowingContracts.formTitle")}
          </h2>
          <BorrowingContractForm
            contract={selectedContract}
            onSubmit={handleFormSubmit}
            onCancel={() => modalRef.current?.close()}
          />
        </div>
      </dialog>
    </>
  );
}

export default BorrowingContractListComponent;
