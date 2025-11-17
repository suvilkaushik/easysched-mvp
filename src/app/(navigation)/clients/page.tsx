'use client';

import React, { useState } from 'react';
import { mockClients } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { Client } from '@/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [viewingClientId, setViewingClientId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});

  const handleView = (client: Client) => {
    if (viewingClientId === client.id) {
      setViewingClientId(null);
    } else {
      setViewingClientId(client.id);
      setEditingClientId(null); // Close edit mode if open
    }
  };

  const handleEdit = (client: Client) => {
    if (editingClientId === client.id) {
      // Cancel editing
      setEditingClientId(null);
      setEditFormData({});
    } else {
      setEditingClientId(client.id);
      setEditFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
      });
      setViewingClientId(null); // Close view mode if open
    }
  };

  const handleSave = (clientId: string) => {
    setClients(clients.map(client => 
      client.id === clientId
        ? { ...client, ...editFormData }
        : client
    ));
    setEditingClientId(null);
    setEditFormData({});
  };

  const handleDelete = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(client => client.id !== clientId));
      if (editingClientId === clientId) {
        setEditingClientId(null);
        setEditFormData({});
      }
      if (viewingClientId === clientId) {
        setViewingClientId(null);
      }
    }
  };

  const handleInputChange = (field: keyof Client, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-2">Manage your client database</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
              {clients.map(client => {
                const isEditing = editingClientId === client.id;
                const isViewing = viewingClientId === client.id;
                
                return (
                  <React.Fragment key={client.id}>
                    <tr className={isEditing || isViewing ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium text-gray-900"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editFormData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-600"
                          />
                        ) : (
                          <div className="text-sm text-gray-600">{client.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editFormData.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-600"
                          />
                        ) : (
                          <div className="text-sm text-gray-600">{client.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{formatDate(client.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(client.id)}
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
                              {isViewing ? 'Hide' : 'View'}
                            </button>
                            <button
                              onClick={() => handleEdit(client)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
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
                        <td colSpan={5} className="px-6 py-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Name</p>
                                <p className="text-sm text-gray-900 mt-1">{client.name}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-sm text-gray-900 mt-1">{client.email}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="text-sm text-gray-900 mt-1">{client.phone}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Joined</p>
                                <p className="text-sm text-gray-900 mt-1">{formatDate(client.createdAt)}</p>
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
    </div>
  );
}
