'use client';

import { useMemo, useState, FormEvent } from 'react';
import { mockAppointments } from '@/lib/data';
import { formatTime } from '@/lib/utils';
import type { Appointment } from '@/types';

const AVAILABLE_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
];

export default function Calendar() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  // Which month/year is being viewed
  const [viewDate, setViewDate] = useState(new Date());

  // Center modal (add appointment)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');

  // Side panel (only if day has appointments)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [sidePanelDate, setSidePanelDate] = useState<Date | null>(null);
  const [editAppointmentId, setEditAppointmentId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editClientName, setEditClientName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTime, setEditTime] = useState('09:00');

  const today = useMemo(() => new Date(), []);

  const viewMonth = viewDate.getMonth();
  const viewYear = viewDate.getFullYear();

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const d = apt.startTime;
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    });
  };

  // ---------- MODAL (ADD APPOINTMENT) ----------

  const openModalForDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setTitle('');
    setClientName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTimeSlot(null);
  };

  const handleAddAppointment = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeSlot) return;

    const [hoursStr, minutesStr] = selectedTimeSlot.split(':');
    const start = new Date(selectedDate);
    start.setHours(Number(hoursStr), Number(minutesStr), 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30-min slot

    const newAppointment: Appointment = {
      id: (appointments.length + 1).toString(),
      clientId: '1', // TODO: hook to real client selection later
      clientName: clientName || 'Walk-in',
      title: title || 'Appointment',
      description: description || undefined,
      startTime: start,
      endTime: end,
      status: 'scheduled',
      createdAt: new Date(),
    };

    setAppointments(prev => [...prev, newAppointment]);
    closeModal();
  };

  // ---------- SIDE PANEL (VIEW / EDIT / DELETE) ----------

  const resetSideEditForm = () => {
    setEditAppointmentId(null);
    setEditTitle('');
    setEditClientName('');
    setEditDescription('');
    setEditTime('09:00');
  };

  const openSidePanelForDate = (date: Date) => {
    setSidePanelDate(date);
    setIsSidePanelOpen(true);
    resetSideEditForm();
  };

  const closeSidePanel = () => {
    setIsSidePanelOpen(false);
    setSidePanelDate(null);
    resetSideEditForm();
  };

  const handleEditFromSide = (apt: Appointment) => {
    setEditAppointmentId(apt.id);
    setEditTitle(apt.title);
    setEditClientName(apt.clientName);
    setEditDescription(apt.description || '');
    const h = apt.startTime.getHours().toString().padStart(2, '0');
    const m = apt.startTime.getMinutes().toString().padStart(2, '0');
    setEditTime(`${h}:${m}`);
  };

  const handleDeleteFromSide = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
    if (editAppointmentId === id) {
      resetSideEditForm();
    }
  };

  const handleSideUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (!sidePanelDate || !editAppointmentId) return;

    const [hoursStr, minutesStr] = editTime.split(':');
    const start = new Date(sidePanelDate);
    start.setHours(Number(hoursStr), Number(minutesStr), 0, 0);

    const old = appointments.find(a => a.id === editAppointmentId);
    if (!old) return;

    const durationMs = old.endTime.getTime() - old.startTime.getTime();
    const end = new Date(start.getTime() + durationMs);

    setAppointments(prev =>
      prev.map(apt =>
        apt.id === editAppointmentId
          ? {
              ...apt,
              clientName: editClientName || 'Walk-in',
              title: editTitle || 'Appointment',
              description: editDescription || undefined,
              startTime: start,
              endTime: end,
            }
          : apt
      )
    );

    resetSideEditForm();
  };

  // ---------- MONTH NAVIGATION + DAY CLICK LOGIC ----------

  const goToPrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;

    const date = new Date(viewYear, viewMonth, day);
    const dayAppointments = getAppointmentsForDate(date);

    if (dayAppointments.length > 0) {
      // ✅ Day has appointments → open side panel (view/edit/delete)
      openSidePanelForDate(date);
    } else {
      // ✅ No appointments → open modal to add appointment for that date
      openModalForDate(date);
    }
  };

  const isEditingSide = Boolean(editAppointmentId);

  return (
    <>
      {/* MAIN CALENDAR */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="px-2 py-1 rounded-full border text-sm hover:bg-gray-100"
            >
              ‹
            </button>
            <h2 className="text-2xl font-bold">
              {monthNames[viewMonth]} {viewYear}
            </h2>
            <button
              type="button"
              onClick={goToNextMonth}
              className="px-2 py-1 rounded-full border text-sm hover:bg-gray-100"
            >
              ›
            </button>
          </div>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => openModalForDate(today)}
          >
            Add Appointment
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center font-semibold text-gray-700 py-2"
            >
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();

            const date = day ? new Date(viewYear, viewMonth, day) : null;
            const dayAppointments = date ? getAppointmentsForDate(date) : [];

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDayClick(day)}
                className={`min-h-24 border border-gray-200 p-2 rounded text-left ${
                  !day ? 'bg-gray-50 cursor-default' : 'bg-white hover:bg-gray-50'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                disabled={!day}
              >
                {day && (
                  <>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {day}
                    </div>
                    {dayAppointments.map(apt => (
                      <div
                        key={apt.id}
                        className="text-xs p-1 mb-1 bg-blue-100 text-blue-800 rounded truncate"
                        title={`${apt.title} - ${formatTime(apt.startTime)}`}
                      >
                        {formatTime(apt.startTime)} {apt.clientName}
                      </div>
                    ))}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER POPUP MODAL (ADD APPOINTMENT) */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Appointments</h3>
                <p className="text-sm text-gray-500">
                  {selectedDate.toLocaleDateString()}
                </p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {/* EXISTING APPOINTMENTS LIST */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Existing appointments
              </p>
              {(() => {
                const dayAppointments = getAppointmentsForDate(selectedDate);

                if (dayAppointments.length === 0) {
                  return (
                    <p className="text-xs text-gray-500">
                      No appointments scheduled for this day.
                    </p>
                  );
                }

                return (
                  <ul className="space-y-2">
                    {dayAppointments.map(apt => (
                      <li
                        key={apt.id}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex flex-col gap-0.5"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {formatTime(apt.startTime)}
                          </span>
                          <span className="text-xs uppercase tracking-wide text-gray-500">
                            {apt.status}
                          </span>
                        </div>
                        <div className="text-gray-800">
                          {apt.clientName} &mdash; {apt.title}
                        </div>
                        {apt.description && (
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {apt.description}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>

            {/* FORM TO ADD NEW APPOINTMENT */}
            <form onSubmit={handleAddAppointment} className="space-y-4 border-t pt-4">
              {/* TIME SLOTS */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Available time slots
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_SLOTS.map(slot => {
                    const [h, m] = slot.split(':').map(Number);
                    const dayAppointments = getAppointmentsForDate(selectedDate);

                    const taken = dayAppointments.some(apt => {
                      const d = apt.startTime;
                      return d.getHours() === h && d.getMinutes() === m;
                    });

                    const isSelected = selectedTimeSlot === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={taken}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`px-2 py-2 rounded-lg text-sm border ${
                          taken
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                            : isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-800 hover:bg-blue-50 border-gray-200'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                {!selectedTimeSlot && (
                  <p className="text-xs text-red-500 mt-1">
                    Please select a time slot.
                  </p>
                )}
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Consultation, Review, etc."
                  required
                />
              </div>

              {/* CLIENT NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client name
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Reason for visit, notes, etc."
                />
              </div>

              <button
                type="submit"
                disabled={!selectedTimeSlot}
                className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Save Appointment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIDE PANEL FOR DAYS THAT HAVE APPOINTMENTS */}
      <div
        className={`fixed inset-0 z-40 transition ${
          isSidePanelOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            isSidePanelOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeSidePanel}
        />

        {/* Panel */}
<div
  className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${
    isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'
  }`}
>
  <div className="flex items-center justify-between px-6 py-4 border-b">
    <div>
      <h3 className="text-lg font-semibold">Day schedule</h3>
      {sidePanelDate && (
        <p className="text-sm text-gray-500">
          {sidePanelDate.toLocaleDateString()}
        </p>
      )}
    </div>

    <div className="flex items-center gap-2">
      {sidePanelDate && (
        <button
          type="button"
          className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => {
            openModalForDate(sidePanelDate);
            closeSidePanel();
          }}
        >
          Add appointment
        </button>
      )}

      <button
        className="text-gray-500 hover:text-gray-700 text-xl"
        onClick={closeSidePanel}
      >
        ×
      </button>
    </div>
  </div>

          {sidePanelDate && (
            <div className="h-[calc(100%-64px)] overflow-y-auto p-6 space-y-6">
              {/* LIST OF APPOINTMENTS */}
              <section>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Appointments on this day
                </p>
                {(() => {
                  const dayAppointments = getAppointmentsForDate(sidePanelDate);

                  return (
                    <ul className="space-y-2">
                      {dayAppointments.map(apt => (
                        <li
                          key={apt.id}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex flex-col gap-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {formatTime(apt.startTime)}
                            </span>
                            <span className="text-xs uppercase tracking-wide text-gray-500">
                              {apt.status}
                            </span>
                          </div>
                          <div className="text-gray-800">
                            {apt.clientName} &mdash; {apt.title}
                          </div>
                          {apt.description && (
                            <div className="text-xs text-gray-600">
                              {apt.description}
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              className="px-2 py-1 text-xs rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleEditFromSide(apt)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 text-xs rounded border border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteFromSide(apt.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </section>

              {/* EDIT FORM */}
              <section className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {isEditingSide ? 'Edit appointment' : 'Select an appointment to edit'}
                </p>
                {isEditingSide ? (
                  <form onSubmit={handleSideUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editTime}
                        onChange={e => setEditTime(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text.sm font-medium text-gray-700 mb-1">
                        Client name
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editClientName}
                        onChange={e => setEditClientName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={resetSideEditForm}
                        className="mt-2 px-4 py-2 text-sm border rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-gray-500">
                    Click &ldquo;Edit&rdquo; on an appointment above to modify it.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}