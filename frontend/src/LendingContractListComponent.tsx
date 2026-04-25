import { HandCoins, PencilSimple, Trash } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  addLendingContract,
  deleteLendingContract,
  editLendingContract,
  getLendingContracts,
} from "./api";
import { LendingContract } from "./entity.interface";
import LendingContractForm from "./LendingContractForm";

const STATUS_BADGE: Record<string, string> = {
  Active: "badge-success",
  Completed: "badge-info",
  Defaulted: "badge-error",
};

function LendingContractListComponent() {
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

  const handleDelete = useCallback((contract: LendingContract) => {
    if (!confirm(`Delete lending contract #${contract.id}?`)) return;
    deleteLendingContract(contract.id)
      .then((result) => {
        if (!result) return;
        setContracts((prev) => prev.filter((c) => c.id !== contract.id));
      })
      .catch((err) => {
        console.error("Error deleting lending contract", err);
        alert(`Failed to delete: ${err?.message ?? err}`);
      });
  }, []);

  const handleFormSubmit = (data: LendingContract, vaultId?: number) => {
    if (data.id) {
      editLendingContract(data)
        .then((contract) => {
          if (!contract) return;
          setContracts((prev) =>
            prev.map((c) => (c.id === contract.id ? contract : c)),
          );
        })
        .catch((err) => console.error("Error editing lending contract", err))
        .finally(() => modalRef.current?.close());
    } else {
      if (vaultId === undefined) return;
      addLendingContract(data, vaultId)
        .then((contract) => {
          if (!contract) return;
          setContracts((prev) => [...prev, contract]);
        })
        .catch((err) => {
          console.error("Error adding lending contract", err);
          alert(`Failed to add: ${err?.message ?? err}`);
        })
        .finally(() => modalRef.current?.close());
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <h2 className="shadow-secondary mb-3 text-3xl font-bold underline shadow-xl ring-4">
          Lending Contracts
        </h2>
        <button className="btn btn-soft btn-primary" onClick={handleAdd}>
          Add Contract
          <HandCoins size={24} />
        </button>
      </div>

      <div className="my-2 overflow-auto ring-1">
        <table className="table-pin-rows table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Contact</th>
              <th>Amount</th>
              <th>Duration</th>
              <th>Return Date</th>
              <th>Category</th>
              <th>Status</th>
              <th>Repaid</th>
              <th>Actions</th>
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
                <td>{contract.financeCategoryType}</td>
                <td>
                  <span
                    className={`badge badge-sm ${STATUS_BADGE[contract.contractStatus] ?? ""}`}
                  >
                    {contract.contractStatus}
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
              ✕
            </button>
          </form>
          <h2 className="mb-4 text-2xl font-bold">Lending Contract</h2>
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
