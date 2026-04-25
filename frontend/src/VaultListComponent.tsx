import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  addVault,
  deleteVault,
  editVault,
  getVaultBalanceHistory,
  getVaults,
} from "./api";
import { Vault, VaultBalanceHistory } from "./entity.interface";
import VaultForm from "./VaultForm";
import { PencilSimple, Trash, Vault as VaultIcon } from "@phosphor-icons/react";

function VaultListComponent() {
  const { t } = useTranslation();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const vaultModalRef = useRef<HTMLDialogElement>(null);
  const [historyVault, setHistoryVault] = useState<Vault | null>(null);
  const [historyRecords, setHistoryRecords] = useState<VaultBalanceHistory[]>(
    [],
  );
  const historyModalRef = useRef<HTMLDialogElement>(null);

  const handleShowHistory = useCallback((vault: Vault) => {
    setHistoryVault(vault);
    setHistoryRecords([]);
    historyModalRef.current?.showModal();
    getVaultBalanceHistory(vault.id)
      .then(setHistoryRecords)
      .catch((err) =>
        console.error("Error fetching vault balance history", err),
      );
  }, []);

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

  const handleDeleteVault = useCallback(
    (vault: Vault) => {
      if (!confirm(t("vaults.deleteConfirm", { name: vault.name }))) return;
      deleteVault(vault.id)
        .then((result) => {
          if (!result) return;
          setVaults((prev) => prev.filter((v) => v.id !== vault.id));
        })
        .catch((error) => {
          console.error("Error deleting vault", error);
        });
    },
    [t],
  );

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
          {t("vaults.title")}
        </h2>
        <button className="btn btn-soft btn-primary" onClick={handleAddVault}>
          {t("vaults.addVault")}
          <VaultIcon size={24} />
        </button>
      </div>
      <div className="my-2 overflow-auto ring-1">
        <table className="table-pin-rows table">
          <thead>
            <tr>
              <th>{t("common.id")}</th>
              <th>{t("common.name")}</th>
              <th>{t("common.description")}</th>
              <th className="text-right">{t("financeCategory.Qard al-Hasan")}</th>
              <th className="text-right">{t("financeCategory.Zakat")}</th>
              <th className="text-right">{t("financeCategory.Sadaqa")}</th>
              <th className="text-right">{t("financeCategory.Waqf")}</th>
              <th className="text-right">{t("vaults.total")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {vaults.map((vault) => (
              <tr
                key={vault.id}
                className="hover:bg-primary hover:text-primary-content transition-colors"
              >
                <td>{vault.id}</td>
                <td>
                  <button
                    className="link link-hover font-medium"
                    onClick={() => handleShowHistory(vault)}
                  >
                    {vault.name}
                  </button>
                </td>
                <td
                  className="cursor-pointer"
                  onClick={() => handleShowHistory(vault)}
                >
                  {vault.description}
                </td>
                <td className="text-right">
                  {(
                    vault.latestBalance?.qardAlHasanBalance ?? 0
                  ).toLocaleString()}
                </td>
                <td className="text-right">
                  {(vault.latestBalance?.zakatBalance ?? 0).toLocaleString()}
                </td>
                <td className="text-right">
                  {(vault.latestBalance?.sadaqaBalance ?? 0).toLocaleString()}
                </td>
                <td className="text-right">
                  {(vault.latestBalance?.waqfBalance ?? 0).toLocaleString()}
                </td>
                <td
                  onClick={() => handleShowHistory(vault)}
                  className="cursor-pointer text-right font-semibold"
                >
                  {(vault.latestBalance?.totalBalance ?? 0).toLocaleString()}
                </td>
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
              {t("common.close")}
            </button>
          </form>
          <h2 className="mb-4 text-2xl font-bold">{t("vaults.formTitle")}</h2>
          <VaultForm
            vault={selectedVault}
            onSubmit={handleFormSubmit}
            onCancel={() => vaultModalRef.current?.close()}
          />
        </div>
      </dialog>

      <dialog ref={historyModalRef} className="modal">
        <div className="modal-box max-w-4xl">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
              onClick={() => {
                setHistoryVault(null);
                setHistoryRecords([]);
              }}
            >
              {t("common.close")}
            </button>
          </form>
          <h2 className="mb-4 text-2xl font-bold">
            {t("vaults.balanceHistory")}
            {historyVault ? ` — ${historyVault.name}` : ""}
          </h2>
          <div className="overflow-auto ring-1">
            <table className="table-pin-rows table">
              <thead>
                <tr>
                  <th>{t("common.id")}</th>
                  <th>{t("vaults.recordedAt")}</th>
                  <th className="text-right">{t("financeCategory.Qard al-Hasan")}</th>
                  <th className="text-right">{t("financeCategory.Zakat")}</th>
                  <th className="text-right">{t("financeCategory.Sadaqa")}</th>
                  <th className="text-right">{t("financeCategory.Waqf")}</th>
                  <th className="text-right">{t("vaults.total")}</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center opacity-60">
                      {t("vaults.noBalanceHistory")}
                    </td>
                  </tr>
                ) : (
                  historyRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>
                        {record.createdAt
                          ? new Date(record.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="text-right">
                        {record.qardAlHasanBalance.toLocaleString()}
                      </td>
                      <td className="text-right">
                        {record.zakatBalance.toLocaleString()}
                      </td>
                      <td className="text-right">
                        {record.sadaqaBalance.toLocaleString()}
                      </td>
                      <td className="text-right">
                        {record.waqfBalance.toLocaleString()}
                      </td>
                      <td className="text-right font-semibold">
                        {record.totalBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default VaultListComponent;
