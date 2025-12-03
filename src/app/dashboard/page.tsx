"use client";

import { useUser } from "@clerk/nextjs";
import StatsOverview from "@/components/dashboard/StatsOverview";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";

export default function DashboardPage() {
  const { isSignedIn } = useUser();
  if (!isSignedIn) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-wide text-white">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Welcome to your EasySched CRM
        </p>
      </header>

      <StatsOverview />

      <section className="grid grid-cols-1 gap-6">
        <UpcomingAppointments />
      </section>
    </div>
  );
}
