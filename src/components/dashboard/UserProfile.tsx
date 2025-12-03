"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { DBUser } from "@/types";

export default function UserProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<DBUser | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/user");
      if (res.ok) {
        const json = await res.json();
        setProfile(json);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-medium">Logged in user</h3>
      <p>Clerk user: {user?.id}</p>
      <p>
        Clerk email:{" "}
        {user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress}
      </p>
      {profile ? (
        <div className="mt-2">
          <div>
            <strong>Full name:</strong> {profile.fullName}
          </div>
          <div>
            <strong>Email:</strong> {profile.email}
          </div>
          <div>
            <strong>Created:</strong>{" "}
            {new Date(profile.createdAt).toLocaleString()}
          </div>
        </div>
      ) : (
        <div>Loading profile from MongoDB...</div>
      )}
    </div>
  );
}
