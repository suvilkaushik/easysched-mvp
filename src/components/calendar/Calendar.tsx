import { mockAppointments } from '@/lib/data';
import { formatTime } from '@/lib/utils';

export default function Calendar() {
  // Simple month view for demonstration
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create array of days
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  // Get appointments for each day
  const getAppointmentsForDay = (day: number) => {
    return mockAppointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.getDate() === day && 
             aptDate.getMonth() === currentMonth && 
             aptDate.getFullYear() === currentYear;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Appointment
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {dayNames.map(day => (
          <div key={day} className="text-center font-semibold text-gray-700 py-2">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          const isToday = day === today.getDate() && 
                         currentMonth === today.getMonth() && 
                         currentYear === today.getFullYear();
          const appointments = day ? getAppointmentsForDay(day) : [];
          
          return (
            <div
              key={index}
              className={`min-h-24 border border-gray-200 p-2 rounded ${
                !day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              {day && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {day}
                  </div>
                  {appointments.map(apt => (
                    <div
                      key={apt.id}
                      className="text-xs p-1 mb-1 bg-blue-100 text-blue-800 rounded truncate"
                      title={`${apt.title} - ${formatTime(apt.startTime)}`}
                    >
                      {formatTime(apt.startTime)} {apt.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
