# EasySched MVP

EasySched is a unified CRM and scheduling system designed to help service-based businesses manage calls, clients, and appointments — all in one place. The platform integrates an AI voice receptionist that automatically answers calls, captures customer information, and books appointments directly into the system.

## Features

### Current Features
- **Dashboard**: Overview of upcoming appointments, total clients, and unread messages
- **Calendar**: Monthly calendar view with appointment scheduling and management
- **Messaging**: Real-time client communication with conversation threads
- **Client Management**: Complete client database with contact information
- **Client Portal**: Self-service portal for clients to view and manage their appointments

### Coming Soon
- **AI Voice Receptionist**: Automated phone answering system
- **Appointment Booking via Phone**: Book appointments through voice calls
- **Conversation Sync**: Sync all voice conversations to the platform
- **iMessage Reminders**: Automated reminders sent to clients

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Runtime**: React 19

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development

The application will be available at `http://localhost:3000` (or the next available port).

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── calendar/     # Calendar page
│   ├── clients/      # Client management page
│   ├── client-portal/# Client self-service portal
│   └── messages/     # Messaging page
├── components/       # React components
│   ├── dashboard/    # Dashboard components
│   ├── calendar/     # Calendar components
│   ├── messaging/    # Messaging components
│   └── Navigation.tsx
├── lib/              # Utility functions and data
│   ├── data.ts       # Mock data (replace with DB in production)
│   └── utils.ts      # Helper functions
└── types/            # TypeScript type definitions
```

## Screenshots

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/730907ad-cb60-4bf7-b502-6a4721fb1d59)

### Calendar
![Calendar](https://github.com/user-attachments/assets/e66f0a93-d637-496c-a89c-2935e9717f35)

### Messages
![Messages](https://github.com/user-attachments/assets/ce103d99-5b57-42eb-bf2d-251912ee0559)

### Clients
![Clients](https://github.com/user-attachments/assets/071dd490-dde3-4453-80e1-d7b95bca9b16)

### Client Portal
![Client Portal](https://github.com/user-attachments/assets/8247a7b8-212a-4b39-82a2-83d27ef10a2f)

## Next Steps

1. **Database Integration**: Replace mock data with a real database (PostgreSQL, MongoDB, etc.)
2. **Authentication**: Implement proper user authentication and authorization
3. **API Development**: Create RESTful or GraphQL APIs for data management
4. **Real-time Updates**: Add WebSocket support for live messaging
5. **AI Voice Integration**: Integrate with voice AI services for the receptionist feature
6. **iMessage Integration**: Connect with Apple's iMessage Business API
7. **Testing**: Add comprehensive unit and integration tests
8. **Deployment**: Deploy to production (Vercel, AWS, etc.)

## Contributing

This is an MVP project. Contributions, issues, and feature requests are welcome!

## License

[MIT License](LICENSE)

