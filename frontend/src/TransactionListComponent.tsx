import { useCallback, useEffect, useRef, useState } from "react";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import {
  addTransaction,
  deleteTransaction,
  editTransactionDescription,
  getTransactions,
} from "./api";
import { Transaction } from "./entity.interface";
import TransactionForm from "./TransactionForm";

const TYPE_BADGE: Record<string, string> = {
  Lend: "badge-success",
  BorrowRepay: "badge-success",
  Borrow: "badge-error",
  LendRepay: "badge-error",
  Expense: "badge-warning",
};

function contractLabel(tx: Transaction): { label: string; cls: string } {
  if (tx.lendingContract)
    return { label: `L#${tx.lendingContract.id}`, cls: "text-success" };
  if (tx.borrowingContract)
    return { label: `B#${tx.borrowingContract.id}`, cls: "text-info" };
  return { label: "—", cls: "opacity-60" };
}

function TransactionListComponent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const addModalRef = useRef<HTMLDialogElement>(null);
  const editModalRef = useRef<HTMLDialogElement>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch((err) => console.error("Error fetching transactions", err));
  }, []);

  const handleAdd = useCallback(() => {
    addModalRef.current?.showModal();
  }, []);

  const handleFormSubmit = (data: Transaction) => {
    addTransaction(data)
      .then((tx) => {
        if (!tx) return;
        setTransactions((prev) => [tx, ...prev]);
      })
      .catch((err) => {
        console.error("Error adding transaction", err);
        alert(`Failed to add transaction: ${err?.message ?? err}`);
      })
      .finally(() => addModalRef.current?.close());
  };

  const handleEdit = useCallback((tx: Transaction) => {
    setEditingTx(tx);
    setEditDescription(tx.description);
    editModalRef.current?.showModal();
  }, []);

  const handleEditSave = () => {
    if (!editingTx) return;
    editTransactionDescription(editingTx.id, editDescription)
      .then((updated) => {
        if (!updated) return;
        setTransactions((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t)),
        );
      })
      .catch((err) => console.error("Error editing transaction", err))
      .finally(() => {
        editModalRef.current?.close();
        setEditingTx(null);
      });
  };

  const handleDelete = useCallback((tx: Transaction) => {
    if (!confirm(`Delete transaction #${tx.id}? This is irreversible.`)) return;
    deleteTransaction(tx.id)
      .then((result) => {
        if (!result) return;
        setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
      })
      .catch((err) => {
        console.error("Error deleting transaction", err);
        alert(`Failed to delete: ${err?.message ?? err}`);
      });
  }, []);

  return (
    <>
      <div className="flex justify-between">
        <h2 className="shadow-secondary mb-3 text-3xl font-bold underline shadow-xl ring-4">
          Transactions
        </h2>
        <button className="btn btn-soft btn-primary" onClick={handleAdd}>
          Add Transaction
          <Plus size={24} />
        </button>
      </div>

      <div className="my-2 overflow-auto ring-1">
        <table className="table-pin-rows table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Type</th>
              <th className="text-right">Amount</th>
              <th>Vault</th>
              <th>Contact</th>
              <th>Category</th>
              <th>Contract</th>
              <th>Description</th>
              <th className="text-right">Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => {
              const contract = contractLabel(tx);
              const isLatest = index === 0;
              return (
                <tr
                  key={tx.id}
                  className="hover:bg-primary hover:text-primary-content transition-colors"
                >
                  <td>{tx.id}</td>
                  <td>
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm ${TYPE_BADGE[tx.transactionType] ?? ""}`}
                    >
                      {tx.transactionType}
                    </span>
                    {tx.expenseType && (
                      <span className="ml-1 text-xs opacity-70">
                        ({tx.expenseType})
                      </span>
                    )}
                  </td>
                  <td className="text-right">{tx.amount.toLocaleString()}</td>
                  <td>{tx.vault?.name ?? `#${tx.vault?.id ?? "?"}`}</td>
                  <td>{tx.contact?.name ?? "—"}</td>
                  <td>{tx.financeCategoryType}</td>
                  <td className={contract.cls}>{contract.label}</td>
                  <td className="max-w-xs truncate" title={tx.description}>
                    {tx.description}
                  </td>
                  <td className="text-right font-semibold">
                    {tx.balance.toLocaleString()}
                  </td>
                  <td className="flex gap-1">
                    <button
                      className="btn btn-ghost btn-circle"
                      onClick={() => handleEdit(tx)}
                      title="Edit description"
                    >
                      <PencilSimple size={24} />
                    </button>
                    {isLatest && (
                      <button
                        className="btn btn-ghost btn-circle text-error"
                        onClick={() => handleDelete(tx)}
                        title="Delete (latest only)"
                      >
                        <Trash size={24} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dialog ref={addModalRef} className="modal">
        <div className="modal-box max-w-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2">
              ✕
            </button>
          </form>
          <h2 className="mb-4 text-2xl font-bold">New Transaction</h2>
          <TransactionForm
            onSubmit={handleFormSubmit}
            onCancel={() => addModalRef.current?.close()}
          />
        </div>
      </dialog>

      <dialog ref={editModalRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
              onClick={() => setEditingTx(null)}
            >
              ✕
            </button>
          </form>
          <h2 className="mb-4 text-2xl font-bold">
            Edit Description{editingTx ? ` — #${editingTx.id}` : ""}
          </h2>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={4}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-neutral btn-outline"
              onClick={() => editModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-outline"
              onClick={handleEditSave}
            >
              Save
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default TransactionListComponent;
