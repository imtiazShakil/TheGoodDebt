import { useCallback, useEffect, useRef, useState } from "react";
import { getContacts } from "./api";
import { ContactDetails } from "./entity.interface";
import ContactForm from "./ContactForm";

function StudentComponent() {
  const [contacts, setContacts] = useState<ContactDetails[]>([]);
  const ref = useRef<HTMLDialogElement>(null);
  const handleShow = useCallback(() => {
    ref.current?.showModal();
  }, [ref]);

  useEffect(() => {
    // Call the function and update the state
    getContacts().then((data) => {
      // Step 3: Update the state with the fetched data
      setContacts(data);
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold mb-3 underline shadow-xl shadow-cyan-500/50 ring-4">
          Hello Contacts!{" "}
        </h2>
        <button className="btn btn-soft btn-primary" onClick={handleShow}>
          Add Contact
        </button>
      </div>
      <div className="max-h-[calc(60vh)] overflow-y-auto mt-2 ring-1 ">
        <table className="table table-pin-rows">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Nid</th>
              <th>Phone</th>
              <th>Address</th>
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
                <td>{contact.phone}</td>
                <td>{contact.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog ref={ref} className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h2 className="text-2xl font-bold mb-4">Contact Form</h2>
          <ContactForm></ContactForm>
        </div>
      </dialog>
    </>
  );
}

export default StudentComponent;
