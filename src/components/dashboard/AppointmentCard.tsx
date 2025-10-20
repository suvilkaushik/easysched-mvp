import { Appointment } from '@/types';
import { formatDate, formatTime, getRelativeTime } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'no-show': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{appointment.title}</h3>
          <p className="text-gray-600 text-sm">{appointment.clientName}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
          {appointment.status}
        </span>
      </div>
      {appointment.description && (
        <p className="text-gray-700 text-sm mb-3">{appointment.description}</p>
      )}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(appointment.startTime)}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
        </div>
      </div>
      {appointment.status === 'scheduled' && (
        <div className="mt-2 text-xs text-blue-600 font-medium">
          {getRelativeTime(appointment.startTime)}
        </div>
      )}
    </div>
  );
}
