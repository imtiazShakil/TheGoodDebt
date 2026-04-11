import { useCallback, useEffect, useRef, useState } from "react";
import { addVault, deleteVault, editVault, getVaults } from "./api";
import { Vault } from "./entity.interface";
import VaultForm from "./VaultForm";
import { PencilSimple, Trash, Vault as VaultIcon } from "@phosphor-icons/react";

function VaultListComponent() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const vaultModalRef = useRef<HTMLDialogElement>(null);

  const handleAddVault = useCallback(() => {
    setSelectedVault(() => {
      vaultModalRef.current?.showModal();
      return null;
    });
  }, [vaultModalRef]);

  const handleEditVault = useCallback(
    (vault: Vault) => {
      setSelectedVault(vault);
      vaultModalRef.current?.showModal();
    },
    [vaultModalRef],
  );

  const handleDeleteVault = useCallback((vault: Vault) => {
    if (!confirm(`Delete vault "${vault.name}"?`)) return;
    deleteVault(vault.id)
      .then((result) => {
        if (!result) return;
        setVaults((prev) => prev.filter((v) => v.id !== vault.id));
      })
      .catch((error) => {
        console.error("Error deleting vault", error);
      });
  }, []);

  const handleFormSubmit = (data: Vault) => {
    if (data.id) {
      editVault(data)
        .then((vault) => {
          if (!vault) return;
          setVaults((prev) => prev.map((v) => (v.id === vault.id ? vault : v)));
        })
        .catch((error) => {
          console.error("Error editing vault", error);
        })
        .finally(() => {
          vaultModalRef.current?.close();
        });
    } else {
      addVault(data)
        .then((vault) => {
          if (!vault) return;
          setVaults((prev) => [...prev, vault]);
        })
        .catch((error) => {
          console.error("Error adding vault", error);
        })
        .finally(() => {
          vaultModalRef.current?.close();
        });
    }
  };

  useEffect(() => {
    getVaults()
      .then(setVaults)
      .catch((error) => {
        console.error("Error fetching vaults", error);
      });
  }, []);

  return (
    <>
      <div className="flex justify-between">
        <h2 className="shadow-secondary mb-3 text-3xl font-bold underline shadow-xl ring-4">
          Vaults
        </h2>
        <button className="btn btn-soft btn-primary" onClick={handleAddVault}>
          Add Vault
          <VaultIcon size={24} />
        </button>
      </div>
      <div className="my-2 overflow-auto ring-1">
        <table className="table-pin-rows table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vaults.map((vault) => (
              <tr
                key={vault.id}
                className="hover:bg-primary hover:text-primary-content transition-colors"
              >
                <td>{vault.id}</td>
                <td>{vault.name}</td>
                <td>{vault.description}</td>
                <td className="flex gap-1">
                  <button
                    className="btn btn-ghost btn-circle"
                    onClick={() => handleEditVault(vault)}
                  >
                    <PencilSimple size={24} />
                  </button>
                  <button
                    className="btn btn-ghost btn-circle text-error"
                    onClick={() => handleDeleteVault(vault)}
                  >
                    <Trash size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog ref={vaultModalRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
              onClick={() => setSelectedVault(null)}
            >
              ✕
            </button>
          </form>
          <h2 className="mb-4 text-2xl font-bold">Vault Form</h2>
          <VaultForm
            vault={selectedVault}
            onSubmit={handleFormSubmit}
            onCancel={() => vaultModalRef.current?.close()}
          />
        </div>
      </dialog>
    </>
  );
}

export default VaultListComponent;
