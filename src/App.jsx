import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Toast from './components/Toast';
import { useApp } from './context/AppContext';
import AdminPage from './pages/AdminPage';
import EventDetailsPage from './pages/EventDetailsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OrganizerApplicationPage from './pages/OrganizerApplicationPage';
import {
  OrganizerDashboardPage,
  OrganizerEventFormPage,
  OrganizerRegistrationsPage
} from './pages/OrganizerPage';
import { TicketDetailsPage, TicketsPage } from './pages/TicketsPage';

function ProtectedRoute({ roles, children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(currentUser.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/become-organizer" element={<OrganizerApplicationPage />} />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute roles={['attendee']}>
                <TicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:bookingId"
            element={
              <ProtectedRoute roles={['attendee']}>
                <TicketDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute roles={['organizer']}>
                <OrganizerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute roles={['organizer']}>
                <OrganizerEventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/edit"
            element={
              <ProtectedRoute roles={['organizer']}>
                <OrganizerEventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/registrations/:eventId"
            element={
              <ProtectedRoute roles={['organizer']}>
                <OrganizerRegistrationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Toast />
    </div>
  );
}
