import {
  mockClients,
  mockAppointments,
  getUnreadMessages,
} from "@/lib/data";

export default function StatsOverview() {
  const totalClients = mockClients.length;
  const upcomingAppointments = mockAppointments.filter(
    (apt) => apt.status === "scheduled" && apt.startTime > new Date()
  ).length;
  const unreadMessages = getUnreadMessages().length;

  const stats = [
    {
      name: "Total Clients",
      value: totalClients,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      iconBg: "bg-blue-500/30",
    },
    {
      name: "Upcoming",
      value: upcomingAppointments,
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      iconBg: "bg-emerald-500/30",
    },
    {
      name: "Unread Messages",
      value: unreadMessages,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      iconBg: "bg-pink-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 shadow-lg shadow-black/40 backdrop-blur-xl hover:-translate-y-1 hover:shadow-2xl transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
                {stat.name}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {stat.value}
              </p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} text-white shadow-inner shadow-black/30`}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
