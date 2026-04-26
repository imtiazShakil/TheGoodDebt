import { PencilSimple, UserPlus } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { addContact, editContact, getContacts } from "./api";
import ContactForm from "./ContactForm";
import { ContactDetails } from "./entity.interface";

function ContactListComponent() {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<ContactDetails[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactDetails | null>(
    null,
  );
  const contactModalRef = useRef<HTMLDialogElement>(null);

  const handleAddContact = useCallback(() => {
    setSelectedContact(() => {
      contactModalRef.current?.showModal();
      return null;
    });
  }, [contactModalRef]);

  const handleEditContact = useCallback(
    (contact: ContactDetails) => {
      setSelectedContact(contact);
      contactModalRef.current?.showModal();
    },
    [contactModalRef],
  );

  const handleFormSubmit = (data: ContactDetails) => {
    if (data.id) {
      editContact(data)
        .then((contact) => {
          if (contact === null) return;
          setContacts((prevContacts) =>
            prevContacts.map((c) => (c.id === contact.id ? contact : c)),
          );
          toast.success(t("contacts.updated"));
        })
        .catch((error) => {
          console.error("Error editing contact", error);
          toast.error(t("contacts.failedToUpdate"));
        })
        .finally(() => contactModalRef.current?.close());
    } else {
      addContact(data)
        .then((contact) => {
          if (contact === null) return;
          setContacts([...contacts, contact]);
          toast.success(t("contacts.added"));
        })
        .catch((error) => {
          console.error("Error adding contact", error);
          toast.error(t("contacts.failedToAdd"));
        })
        .finally(() => contactModalRef.current?.close());
    }
  };

  useEffect(() => {
    getContacts()
      .then((contactList) => {
        setContacts(contactList);
      })
      .catch((error) => {
        console.error("Error fetching contacts", error);
      });
  }, []);

  return (
    <>
      <div className="flex justify-between">
        <h2 className="shadow-secondary mb-3 text-3xl font-bold underline shadow-xl ring-4">
          {t("contacts.title")}
        </h2>
        <button className="btn btn-soft btn-primary" onClick={handleAddContact}>
          {t("contacts.addContact")}
          <UserPlus size={24} />
        </button>
      </div>
      <div className="my-2 overflow-auto ring-1">
        <table className="table-pin-rows table">
          <thead>
            <tr>
              <th>{t("common.id")}</th>
              <th>{t("common.name")}</th>
              <th>{t("contacts.nid")}</th>
              <th>{t("contacts.fatherName")}</th>
              <th>{t("common.phone")}</th>
              <th>{t("common.address")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className="hover:bg-primary hover:text-primary-content transition-colors"
              >
                <td>{contact.id}</td>
                <td>{contact.name}</td>
                <td>{contact.nidInfo}</td>
                <td>{contact.fatherName}</td>
                <td>{contact.phone}</td>
                <td>{contact.address}</td>
                <td>
                  <button
                    className="btn btn-ghost btn-circle"
                    onClick={() => handleEditContact(contact)}
                  >
                    <PencilSimple size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog ref={contactModalRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
              onClick={() => setSelectedContact(null)}
            >
              {t("common.close")}
            </button>
          </form>
          <h2 className="mb-4 text-2xl font-bold">{t("contacts.formTitle")}</h2>
          <ContactForm
            contact={selectedContact}
            onSubmit={handleFormSubmit}
            onCancel={() => contactModalRef.current?.close()}
          />
        </div>
      </dialog>
    </>
  );
}

export default ContactListComponent;
