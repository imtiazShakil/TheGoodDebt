import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ContactDetails } from "./entity.interface";

interface ContactFormProps {
  contact?: ContactDetails | null;
  onSubmit: (data: ContactDetails) => void;
  onCancel: () => void;
}

const ContactForm = ({ contact, onSubmit, onCancel }: ContactFormProps) => {
  const { t } = useTranslation();
  const [id, setId] = useState(contact?.id ?? "");
  const [name, setName] = useState(contact?.name ?? "");
  const [nidInfo, setNidInfo] = useState(contact?.nidInfo ?? "");
  const [address, setAddress] = useState(contact?.address ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [fatherName, setFatherName] = useState(contact?.fatherName ?? "");

  useEffect(() => {
    if (contact) {
      setId(contact.id);
      setName(contact.name);
      setNidInfo(contact.nidInfo);
      setAddress(contact.address);
      setPhone(contact.phone);
      setFatherName(contact.fatherName);
    } else resetForm();
  }, [contact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contact: ContactDetails = {
      id,
      name,
      nidInfo,
      address,
      phone,
      fatherName,
    } as ContactDetails;

    onSubmit(contact);
    resetForm();
  };

  const resetForm = () => {
    setId("");
    setName("");
    setNidInfo("");
    setAddress("");
    setPhone("");
    setFatherName("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex items-center">
          <label className="w-1/4 text-sm font-semibold" htmlFor="name">
            {t("common.name")}
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
          <label className="w-1/4 text-sm font-semibold" htmlFor="nidInfo">
            {t("contacts.nidInfo")}
          </label>
          <input
            type="text"
            id="nidInfo"
            value={nidInfo}
            onChange={(e) => setNidInfo(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="flex items-center">
          <label className="w-1/4 text-sm font-semibold" htmlFor="address">
            {t("common.address")}
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="flex items-center">
          <label className="w-1/4 text-sm font-semibold" htmlFor="phone">
            {t("common.phone")}
          </label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="flex items-center">
          <label className="w-1/4 text-sm font-semibold" htmlFor="fatherName">
            {t("contacts.fathersName")}
          </label>
          <input
            type="text"
            id="fatherName"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-neutral btn-outline mr-2"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </button>
          <button type="submit" className="btn btn-primary btn-outline">
            {contact ? t("common.update") : t("common.add")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;
