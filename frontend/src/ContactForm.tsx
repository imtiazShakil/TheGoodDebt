import React, { useState } from "react";
import { ContactDetails } from "./entity.interface";

interface ContactFormProps {
  onSubmit: (data: ContactDetails) => void;
}

const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    const contact: ContactDetails = {} as ContactDetails;
    contact.name = name;
    contact.nidInfo = email;
    contact.address = message;
    contact.phone = "1234567890";
    contact.fatherName = "John Doe Sr.";

    onSubmit(contact);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setMessage("");
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
          htmlFor="email"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="message"
        >
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="textarea textarea-bordered w-full"
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
