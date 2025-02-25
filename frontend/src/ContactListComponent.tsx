import { useEffect, useState } from "react";
import { getContacts } from "./api";
import { ContactDetails } from "./entity.interface";

function StudentComponent() {
  const [contacts, setContacts] = useState<ContactDetails[]>([]);
  useEffect(() => {
    // Call the function and update the state
    getContacts().then((data) => {
      // Step 3: Update the state with the fetched data
      setContacts(data);
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <>
      <h2 className="text-3xl font-bold mb-3 underline shadow-xl shadow-cyan-500/50 ring-4">
        Hello Contacts!{" "}
      </h2>
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
    </>
  );
}

export default StudentComponent;
