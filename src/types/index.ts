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
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  createdAt: Date;
}

export interface Message {
  id: string;
  clientId: string;
  clientName: string;
  content: string;
  sender: 'client' | 'admin';
  timestamp: Date;
  read: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
}

// Placeholder for future AI voice receptionist integration
export interface VoiceCall {
  id: string;
  phoneNumber: string;
  duration: number;
  transcript?: string;
  appointmentCreated?: boolean;
  timestamp: Date;
}
