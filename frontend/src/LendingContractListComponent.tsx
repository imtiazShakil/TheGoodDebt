import { HandCoins, PencilSimple, Trash } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  addLendingContract,
  deleteLendingContract,
  editLendingContract,
  getLendingContracts,
} from "./api";
import { IpcError, LendingContract } from "./entity.interface";
import LendingContractForm from "./LendingContractForm";

const STATUS_BADGE: Record<string, string> = {
  Active: "badge-success",
  Completed: "badge-info",
  Defaulted: "badge-error",
};

function LendingContractListComponent() {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<LendingContract[]>([]);
  const [selectedContract, setSelectedContract] =
    useState<LendingContract | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    getLendingContracts()
      .then(setContracts)
      .catch((err) => console.error("Error fetching lending contracts", err));
  }, []);

  const handleAdd = useCallback(() => {
    setSelectedContract(() => {
      modalRef.current?.showModal();
      return null;
    });
  }, []);

  const handleEdit = useCallback((contract: LendingContract) => {
    setSelectedContract(contract);
    modalRef.current?.showModal();
  }, []);

  const handleDelete = useCallback(
    (contract: LendingContract) => {
      if (!confirm(t("lendingContracts.deleteConfirm", { id: contract.id })))
        return;
      deleteLendingContract(contract.id)
        .then((result) => {
          if (!result) return;
          setContracts((prev) => prev.filter((c) => c.id !== contract.id));
          toast.success(t("lendingContracts.deleted"));
        })
        .catch((err: IpcError) => {
          console.error("Error deleting lending contract", err);
          if (err.code) {
            toast.error(t(err.code, err.values));
          } else {
            toast.error(t("lendingContracts.failedToDelete"), { description: err.message });
          }
        });
    },
    [t],
  );

  const handleFormSubmit = (data: LendingContract, vaultId?: number) => {
    if (data.id) {
      editLendingContract(data)
        .then((contract) => {
          if (!contract) return;
          setContracts((prev) =>
            prev.map((c) => (c.id === contract.id ? contract : c)),
          );
          toast.success(t("lendingContracts.updated"));
        })
        .catch((err: IpcError) => {
          console.error("Error editing lending contract", err);
          if (err.code) {
            toast.error(t(err.code, err.values));
          } else {
            toast.error(t("lendingContracts.failedToUpdate"));
          }
        })
        .finally(() => modalRef.current?.close());
    } else {
      if (vaultId === undefined) return;
      addLendingContract(data, vaultId)
        .then((contract) => {
          if (!contract) return;
          setContracts((prev) => [...prev, contract]);
          toast.success(t("lendingContracts.added"));
        })
        .catch((err: IpcError) => {
          console.error("Error adding lending contract", err);
          if (err.code) {
            toast.error(t(err.code, err.values));
          } else {
            toast.error(t("lendingContracts.failedToAdd"), { description: err.message });
          }
        })
        .finally(() => modalRef.current?.close());
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <h2 className="shadow-secondary mb-3 text-3xl font-bold underline shadow-xl ring-4">
          {t("lendingContracts.title")}
        </h2>
        <button className="btn btn-soft btn-primary" onClick={handleAdd}>
          {t("lendingContracts.addContract")}
          <HandCoins size={24} />
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
        <div className="modal-box">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
              onClick={() => setSelectedContract(null)}
            >
              {t("common.close")}
            </button>
          </form>
          <h2 className="mb-4 text-2xl font-bold">
            {t("lendingContracts.formTitle")}
          </h2>
          <LendingContractForm
            contract={selectedContract}
            onSubmit={handleFormSubmit}
            onCancel={() => modalRef.current?.close()}
          />
        </div>
      </dialog>
    </>
  );
}

export default LendingContractListComponent;
