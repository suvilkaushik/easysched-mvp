"use client";

import StatsOverview from "@/components/dashboard/StatsOverview";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
// `useUser` removed — header handles sign-in UI

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to your EasySched CRM</p>
          </div>
        </div>

        <StatsOverview />

        <div className="grid grid-cols-1 gap-6">
          <UpcomingAppointments />
        </div>
      </main>
    </div>
  );
}
