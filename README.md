# KFUPMEvents

A campus event management platform for King Fahd University of Petroleum and Minerals (KFUPM). Built with React and Vite, the application allows students to discover and register for university events, organizers to create and manage events, and administrators to oversee the entire platform.

## Features

### Attendeee
- Browse and search events by title, tag, or category (Workshop, Career, Cultural, Competition, Sports, Seminar)
- View event details including description, schedule, location, capacity, and policies
- Book tickets with per-user quantity limits
- View and manage tickets with QR codes for check-in
- Cancel bookings before the cancellation deadline
- Download calendar (.ics) files and share event links
- Download tickets as files

### Organizer
- Dashboard with stats on active events, pending approvals, registrations, and drafts
- Multi-step event creation form (Basic Info, Schedule, Tickets, Review)
- Upload custom cover images or use built-in theme backgrounds
- Save drafts and submit events for admin approval
- Edit events that are not yet approved
- View registrations and check in attendees per event

### Admin
- Dashboard with platform-wide analytics (pending events, applications, total users, all events)
- Review and approve/reject pending events
- View and delete any event
- Review organizer applications and approve new organizer accounts
- Manage users: change roles (attendee/organizer/admin) and ban/unban accounts

### General
- Role-based route protection
- Responsive design with mobile hamburger menu
- Toast notifications for user feedback
- Data persistence via localStorage
- Demo quick-login buttons for all three roles
- Organizer application form for clubs, departments, and university units

## Tech Stack

- **React 19** with React Router v7
- **Vite 8** for development and build tooling
- **Bootstrap 5** (dependency, CSS-driven custom styling)
- **Pure CSS** custom design system with CSS variables
- **localStorage** for client-side data persistence

## Project Structure

```
src/
  components/
    EventCard.jsx        # Event card with theme image, metadata, and progress bar
    Header.jsx           # Sticky navbar with role-aware navigation
    QRCodePlaceholder.jsx# QR code renderer for tickets
    ThemeImage.jsx       # Themed cover image component
    Toast.jsx            # Toast notification display
  context/
    AppContext.jsx        # Global state provider (users, events, bookings, applications)
  data/
    mockData.js           # Seed data for users, events, bookings, and applications
  pages/
    AdminPage.jsx         # Admin dashboard with tabs for reviews, events, applications, users
    EventDetailsPage.jsx  # Event detail view with booking sidebar
    HomePage.jsx          # Event listing with search and category filters
    LoginPage.jsx         # Login form with demo quick-login
    OrganizerApplicationPage.jsx # Organizer registration form
    OrganizerPage.jsx     # Organizer dashboard, event form, and registrations
    TicketsPage.jsx       # Ticket list and ticket detail with QR code
  styles/
    app.css               # Full custom CSS design system
  utils/
    actions.js            # Calendar download and event sharing utilities
    helpers.js            # Date/time formatting, seat calculations, ID generation
  App.jsx                 # Route definitions and protected route wrapper
  main.jsx                # App entry point with BrowserRouter and AppProvider
```

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.


## Demo Accounts

The app includes three pre-configured demo accounts accessible via quick-login buttons on the sign-in page:

| Role      | Email                    | Password      |
|-----------|--------------------------|---------------|
| Attendee  | attendee@kfupm.edu.sa    | Attendee123   |
| Organizer | organizer@kfupm.edu.sa   | Organizer123  |
| Admin     | admin@kfupm.edu.sa       | Admin1234     |
