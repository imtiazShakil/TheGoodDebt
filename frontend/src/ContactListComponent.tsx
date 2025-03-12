import { useCallback, useEffect, useRef, useState } from "react";
import { addContact, editContact, getContacts } from "./api";
import { ContactDetails } from "./entity.interface";
import ContactForm from "./ContactForm";
import { PencilSimple, UserPlus } from "@phosphor-icons/react";

function ContactListComponent() {
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
      setSelectedContact(contact); // Set the selected contact for editing
      contactModalRef.current?.showModal();
    },
    [contactModalRef],
  );

  const handleFormSubmit = (data: ContactDetails) => {
    console.log("handleFormsubmit contact", data);

    if (data.id) {
      editContact(data)
        .then((contact) => {
          if (contact === null) {
            console.error("Error editing contact");
            return;
          }
          // Step 4: Update the state with the new contact
          setContacts((prevContacts) =>
            prevContacts.map((c) => (c.id === contact.id ? contact : c)),
          );
        })
        .catch((error) => {
          console.error("Error editing contact", error);
        })
        .finally(() => {
          contactModalRef.current?.close();
        });

      // Edit contact
    } else {
      // Add contact
      addContact(data)
        .then((contact) => {
          if (contact === null) {
            console.error("Error adding contact");
            return;
          }
          // Step 4: Update the state with the new contact
          setContacts([...contacts, contact]);
        })
        .catch((error) => {
          console.error("Error adding contact", error);
        })
        .finally(() => {
          contactModalRef.current?.close();
        });
    }

    // how to reset the contact form?
  };

  useEffect(() => {
    // Call the function and update the state
    getContacts()
      .then((contactList) => {
        // Step 3: Update the state with the fetched data
        setContacts(contactList);
      })
      .catch((error) => {
        console.error("Error fetching contacts", error);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold mb-3 underline shadow-xl shadow-cyan-500/50 ring-4">
          Contacts!{" "}
        </h2>
        <button className="btn btn-soft btn-primary" onClick={handleAddContact}>
          Add Contact
          <UserPlus size={24} />
        </button>
      </div>
      <div className="max-h-[calc(60vh)] overflow-y-auto mt-2 ring-1 ">
        <table className="table table-pin-rows">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Nid</th>
              <th>FatherName</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
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
            {/* if there is a button in form, it will close the modal */}
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setSelectedContact(null)}
            >
              ✕
            </button>
          </form>
          <h2 className="text-2xl font-bold mb-4">Contact Form</h2>
          <ContactForm
            contact={selectedContact}
            onSubmit={handleFormSubmit}
            onCancel={() => contactModalRef.current?.close()}
          ></ContactForm>
        </div>
      </dialog>
    </>
  );
}

export default ContactListComponent;
