"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { DBClient } from "@/types";

export default function ClientsPanel() {
  const { user } = useUser();
  const [clients, setClients] = useState<DBClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const json = await res.json();
        setClients(json || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-medium">Clients</h3>
      <p>Viewing as Clerk user: {user?.id}</p>
      {loading ? (
        <div>Loading clients…</div>
      ) : clients.length === 0 ? (
        <div>No clients found.</div>
      ) : (
        <ul>
          {clients.map((c) => (
            <li key={String(c._id)} className="py-1">
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm">{c.email || c.phone}</div>
              <div className="text-xs">{c.serviceAddress}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
