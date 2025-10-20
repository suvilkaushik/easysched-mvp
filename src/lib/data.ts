import { Appointment, Client, Message } from '@/types';

// Mock data for demonstration purposes
// In production, this would be replaced with actual database queries

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 234-5678',
    createdAt: new Date('2025-02-01'),
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '(555) 345-6789',
    createdAt: new Date('2025-03-10'),
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'John Doe',
    title: 'Initial Consultation',
    description: 'First meeting to discuss requirements',
    startTime: new Date('2025-10-21T10:00:00'),
    endTime: new Date('2025-10-21T11:00:00'),
    status: 'scheduled',
    createdAt: new Date('2025-10-15'),
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Jane Smith',
    title: 'Follow-up Session',
    description: 'Review progress and next steps',
    startTime: new Date('2025-10-22T14:00:00'),
    endTime: new Date('2025-10-22T15:00:00'),
    status: 'scheduled',
    createdAt: new Date('2025-10-16'),
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Mike Johnson',
    title: 'Project Planning',
    startTime: new Date('2025-10-20T09:00:00'),
    endTime: new Date('2025-10-20T10:00:00'),
    status: 'completed',
    createdAt: new Date('2025-10-10'),
  },
  {
    id: '4',
    clientId: '1',
    clientName: 'John Doe',
    title: 'Strategy Review',
    startTime: new Date('2025-10-23T15:00:00'),
    endTime: new Date('2025-10-23T16:30:00'),
    status: 'scheduled',
    createdAt: new Date('2025-10-18'),
  },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'John Doe',
    content: 'Hi, I need to reschedule my appointment.',
    sender: 'client',
    timestamp: new Date('2025-10-20T09:30:00'),
    read: false,
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Jane Smith',
    content: 'Thank you for the last session!',
    sender: 'client',
    timestamp: new Date('2025-10-19T16:45:00'),
    read: true,
  },
  {
    id: '3',
    clientId: '2',
    clientName: 'Jane Smith',
    content: 'You\'re welcome! Looking forward to our next meeting.',
    sender: 'admin',
    timestamp: new Date('2025-10-19T17:00:00'),
    read: true,
  },
];

export function getUpcomingAppointments(): Appointment[] {
  const now = new Date();
  return mockAppointments
    .filter(apt => apt.startTime > now && apt.status === 'scheduled')
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export function getAppointmentsByClient(clientId: string): Appointment[] {
  return mockAppointments.filter(apt => apt.clientId === clientId);
}

export function getUnreadMessages(): Message[] {
  return mockMessages.filter(msg => !msg.read && msg.sender === 'client');
}
