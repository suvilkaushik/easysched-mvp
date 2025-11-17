"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { Client, Appointment } from "@/types";

export default function ClientPortalClient({
  clients,
  initialClientId,
}: {
  clients: Client[];
  initialClientId?: string;
}) {
  const [selectedClientId, setSelectedClientId] = useState(
    initialClientId || (clients[0]?.id ?? null)
  );
  const client = clients.find((c) => c.id === selectedClientId) || null;

  // Mock appointments for now — the server can provide real data later
  const appointments: Appointment[] = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {client?.name || "Client"}!
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm">Total Appointments</h3>
            <p className="text-3xl font-bold mt-2">{appointments.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm">Upcoming</h3>
            <p className="text-3xl font-bold mt-2">
              {
                appointments.filter(
                  (a) => a.status === "scheduled" && a.startTime > new Date()
                ).length
              }
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm">Completed</h3>
            <p className="text-3xl font-bold mt-2">
              {appointments.filter((a) => a.status === "completed").length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Appointments</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Book Appointment
            </button>
          </div>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No appointments found
              </div>
            ) : (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {appointment.title}
                      </h3>
                      {appointment.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {appointment.description}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-2">
                        {formatDateTime(appointment.startTime)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === "scheduled" &&
                      appointment.startTime > new Date() ? (
                        <>
                          <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                            Reschedule
                          </button>
                          <button className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50">
                            Cancel
                          </button>
                        </>
                      ) : appointment.status === "completed" ? (
                        <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">
                          Completed
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🎙️ AI Voice Receptionist (Coming Soon)
          </h3>
          <p className="text-blue-800">
            Soon you'll be able to book appointments by phone! Our AI voice
            receptionist will answer your calls, understand your needs, and
            schedule appointments automatically. You'll also receive iMessage
            reminders for your upcoming appointments.
          </p>
        </div>
      </main>
    </div>
  );
}
