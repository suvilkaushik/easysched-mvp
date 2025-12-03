import { getUpcomingAppointments } from "@/lib/data";
import AppointmentCard from "./AppointmentCard";

export default function UpcomingAppointments() {
  const appointments = getUpcomingAppointments();

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 shadow-lg shadow-black/40 backdrop-blur-xl">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Upcoming Appointments
      </h2>

      {appointments.length === 0 ? (
        <div className="text-center py-10 text-slate-300">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-slate-500/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p>No upcoming appointments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
}
