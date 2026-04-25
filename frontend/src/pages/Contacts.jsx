import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "" });

  const token = localStorage.getItem("token");

  // 🔹 Fetch existing contacts
  const fetchContacts = async () => {
    try {
      const res = await API.get("/users/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // 🔹 Add contact
  const addContact = async () => {
    try {
      await API.post(
        "/users/add-contact",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setForm({ name: "", phone: "" });
      fetchContacts(); // refresh list
    } catch (err) {
      alert("Error adding contact");
    }
  };

  // 🔥 DELETE CONTACT (FIXED POSITION)
  const deleteContact = async (id) => {
    try {
      await API.delete(`/users/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchContacts(); // refresh list
    } catch (err) {
      alert("Error deleting contact");
    }
  };

  return (
    <Layout>
      <h1 className="text-green-400 text-xl mb-4">📞 Emergency Contacts</h1>

      {/* Add Contact Form */}
      <div className="bg-gray-800 p-4 rounded-lg mb-4 space-y-3">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 rounded bg-black border border-green-500"
        />

        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full p-2 rounded bg-black border border-green-500"
        />

        <button
          onClick={addContact}
          className="w-full bg-green-500 py-2 rounded text-black font-bold"
        >
          ➕ Add Contact
        </button>
      </div>

      {/* Contact List */}
      <div className="space-y-2">
        {contacts.map((c) => (
          <div
            key={c._id}
            className="bg-gray-800 p-3 rounded-lg flex justify-between items-center"
          >
            <div>
              <p>{c.name}</p>
              <p className="text-green-400 text-sm">{c.phone}</p>
            </div>

            {/* ❌ DELETE BUTTON */}
            <button
              onClick={() => deleteContact(c._id)}
              className="bg-red-500 px-3 py-1 rounded text-white"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Contacts;