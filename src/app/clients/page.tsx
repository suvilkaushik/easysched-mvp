"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { formatDate } from "@/lib/utils";
import { DBClient } from "@/types";

export default function ClientsPage() {
  const { isSignedIn } = useUser();
  const [clients, setClients] = useState<DBClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [viewingClientId, setViewingClientId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<DBClient>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Failed to fetch clients", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addFormData),
      });
      if (res.ok) {
        const newClient = await res.json();
        setClients([...clients, newClient]);
        setShowAddModal(false);
        setAddFormData({ name: "", phone: "", email: "" });
      } else {
        alert("Failed to add client");
      }
    } catch (err) {
      console.error("Failed to add client", err);
      alert("Error adding client");
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (client: DBClient) => {
    if (viewingClientId === client._id?.toString()) {
      setViewingClientId(null);
    } else {
      setViewingClientId(client._id?.toString() || "");
      setEditingClientId(null);
    }
  };

  const handleEdit = (client: DBClient) => {
    if (editingClientId === client._id?.toString()) {
      setEditingClientId(null);
      setEditFormData({});
    } else {
      setEditingClientId(client._id?.toString() || "");
      setEditFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
      });
      setViewingClientId(null);
    }
  };

  const handleSave = async (clientId: string) => {
    // For now, just update local state; implement API update if needed
    setClients(
      clients.map((client) =>
        (client._id?.toString() === clientId) ? { ...client, ...editFormData } : client
      )
    );
    setEditingClientId(null);
    setEditFormData({});
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
      if (res.ok) {
        setClients(clients.filter((client) => client._id?.toString() !== clientId));
        if (editingClientId === clientId) {
          setEditingClientId(null);
          setEditFormData({});
        }
        if (viewingClientId === clientId) {
          setViewingClientId(null);
        }
      } else {
        alert("Failed to delete client");
      }
    } catch (err) {
      console.error("Error deleting client", err);
      alert("Error deleting client");
    }
  };

  const handleInputChange = (field: keyof DBClient, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isSignedIn)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Please sign in to view clients
          </h2>
        </div>
      </div>
    );

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-2">Manage your client database</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Client
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => {
                const clientId = client._id?.toString() || "";
                const isEditing = editingClientId === clientId;
                const isViewing = viewingClientId === clientId;

                return (
                  <React.Fragment key={clientId}>
                    <tr
                      className={
                        isEditing || isViewing
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.name || ""}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium text-gray-900"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {client.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editFormData.email || ""}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-600"
                          />
                        ) : (
                          <div className="text-sm text-gray-600">
                            {client.email || "N/A"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editFormData.phone || ""}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-600"
                          />
                        ) : (
                          <div className="text-sm text-gray-600">
                            {client.phone || "N/A"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(client.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(clientId)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => handleEdit(client)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-4">
                            <button
                              onClick={() => handleView(client)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {isViewing ? "Hide" : "View"}
                            </button>
                            <button
                              onClick={() => handleEdit(client)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(clientId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {isViewing && !isEditing && (
                      <tr className="bg-blue-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              Client Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Name
                                </p>
                                <p className="text-sm text-gray-900 mt-1">
                                  {client.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Email
                                </p>
                                <p className="text-sm text-gray-900 mt-1">
                                  {client.email || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Phone
                                </p>
                                <p className="text-sm text-gray-900 mt-1">
                                  {client.phone || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Joined
                                </p>
                                <p className="text-sm text-gray-900 mt-1">
                                  {formatDate(client.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">Add New Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                disabled={submitting || !addFormData.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
