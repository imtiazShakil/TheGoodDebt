import React, { useEffect, useState } from "react";
import { Vault } from "./entity.interface";

interface VaultFormProps {
  vault?: Vault | null;
  onSubmit: (data: Vault) => void;
  onCancel: () => void;
}

const VaultForm = ({ vault, onSubmit, onCancel }: VaultFormProps) => {
  const [id, setId] = useState(vault?.id ?? "");
  const [name, setName] = useState(vault?.name ?? "");
  const [description, setDescription] = useState(vault?.description ?? "");

  useEffect(() => {
    if (vault) {
      setId(vault.id);
      setName(vault.name);
      setDescription(vault.description ?? "");
    } else {
      resetForm();
    }
  }, [vault]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Vault = { id, name, description } as Vault;
    onSubmit(data);
    resetForm();
  };

  const resetForm = () => {
    setId("");
    setName("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex items-center">
          <label className="w-1/4 text-sm font-semibold" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="flex items-center">
          <label className="w-1/4 text-sm font-semibold" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
            rows={3}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-neutral btn-outline mr-2"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-outline">
            {vault ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default VaultForm;
