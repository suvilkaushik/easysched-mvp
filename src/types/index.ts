import { z } from "zod";

// Backwards-compatible existing interfaces
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  createdAt: Date;
}

export interface Message {
  id: string;
  clientId: string;
  clientName: string;
  content: string;
  sender: "client" | "admin";
  timestamp: Date;
  read: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
}

// DB types for the new Clerk + MongoDB integration
export interface DBUser {
  clerkUserId: string; // required, unique
  email?: string;
  fullName?: string;
  businessName?: string | null;
  createdAt: Date;
  preferences?: {
    timezone?: string | null;
    notifications?: boolean;
  } | null;
}

export interface DBClient {
  _id?: unknown;
  ownerClerkId: string; // foreign key -> users.clerkUserId
  name: string;
  phone?: string | null;
  email?: string | null;
  serviceAddress?: string | null;
  createdAt: Date;
}

// Zod schema for validating client creation input (server-side)
export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  serviceAddress: z.string().optional(),
});

// Placeholder for future AI voice receptionist integration
export interface VoiceCall {
  id: string;
  phoneNumber: string;
  duration: number;
  transcript?: string;
  appointmentCreated?: boolean;
  timestamp: Date;
}
