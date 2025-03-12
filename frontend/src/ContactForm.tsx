import React, { useEffect, useState } from "react";
import { ContactDetails } from "./entity.interface";

interface ContactFormProps {
  contact?: ContactDetails | null;
  onSubmit: (data: ContactDetails) => void;
  onCancel: () => void;
}

const ContactForm = ({ contact, onSubmit, onCancel }: ContactFormProps) => {
  const [id, setId] = useState(contact?.id ?? "");
  const [name, setName] = useState(contact?.name ?? "");
  const [nidInfo, setNidInfo] = useState(contact?.nidInfo ?? "");
  const [address, setAddress] = useState(contact?.address ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [fatherName, setFatherName] = useState(contact?.fatherName ?? "");

  useEffect(() => {
    console.log("contactform useeffect");
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
    // Handle form submission logic here
    // Handle form submission logic here
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
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="name"
        >
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
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="nidInfo"
        >
          NID Info
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
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="address"
        >
          Address
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
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="phone"
        >
          Phone
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
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="fatherName"
        >
          Father&apos;s Name
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
          Cancel
        </button>

        <button type="submit" className="btn btn-primary btn-outline">
          {contact ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
