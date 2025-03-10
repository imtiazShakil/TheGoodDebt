import React, { useState } from "react";
import { ContactDetails } from "./entity.interface";

interface ContactFormProps {
  onSubmit: (data: ContactDetails) => void;
}

const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const [name, setName] = useState("");
  const [nidInfo, setNidInfo] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [fatherName, setFatherName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    // Handle form submission logic here
    const contact: ContactDetails = {
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
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
