import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  bookingsSeed,
  categories,
  eventsSeed,
  organizerApplicationsSeed,
  usersSeed
} from '../data/mockData';
import { useLanguage } from './LanguageContext';
import { isPastEvent, randomId } from '../utils/helpers';

const AppContext = createContext(null);

const demoAccounts = {
  attendee: 'u-attendee',
  organizer: 'u-organizer',
  admin: 'u-admin'
};

const defaultNewEvent = {
  title: '',
  category: 'Workshop',
  description: '',
  longDescription: '',
  date: '2026-04-25',
  time: '12:00',
  location: '',
  capacity: 50,
  perUserLimit: 1,
  visibility: 'university',
  tags: ['Workshop'],
  policy: '',
  mode: 'Offline',
  priceType: 'Free',
  coverTheme: 'theme-ai',
  imageData: ''
};

const STORAGE_KEYS = {
  users: 'campusevents-users',
  events: 'campusevents-events',
  bookings: 'campusevents-bookings',
  applications: 'campusevents-applications',
  currentUserId: 'campusevents-current-user-id'
};

const readStored = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }) {
  const { statusLabel, t } = useLanguage();
  const [users, setUsers] = useState(() => readStored(STORAGE_KEYS.users, usersSeed));
  const [events, setEvents] = useState(() => readStored(STORAGE_KEYS.events, eventsSeed));
  const [bookings, setBookings] = useState(() => readStored(STORAGE_KEYS.bookings, bookingsSeed));
  const [applications, setApplications] = useState(() => readStored(STORAGE_KEYS.applications, organizerApplicationsSeed));
  const [currentUserId, setCurrentUserId] = useState(() => readStored(STORAGE_KEYS.currentUserId, null));
  const [toast, setToast] = useState(null);

  const currentUser = users.find((user) => user.id === currentUserId) || null;


  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentUserId) {
      window.localStorage.setItem(STORAGE_KEYS.currentUserId, JSON.stringify(currentUserId));
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.currentUserId);
    }
  }, [currentUserId]);

  const visibleEvents = useMemo(() => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'organizer') return events;

    return events.filter((event) => event.status === 'approved');
  }, [currentUser, events]);

  const userBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter((booking) => booking.userId === currentUser.id);
  }, [bookings, currentUser]);

  const organizerEvents = useMemo(() => {
    if (!currentUser || currentUser.role !== 'organizer') return [];
    return events.filter((event) => event.organizerId === currentUser.id);
  }, [currentUser, events]);

  const pushToast = (message, tone = 'success') => {
    setToast({ id: Date.now(), message, tone });
    setTimeout(() => setToast(null), 3000);
  };

  const loginAs = (role) => {
    const userId = demoAccounts[role];
    setCurrentUserId(userId);
    pushToast(`${t('signedInAs')} ${statusLabel(role)}.`);
  };

  const login = (email, password) => {
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, message: t('noAccountFound') };
    if (user.isBanned) return { ok: false, message: t('accountDisabled') };
    if (user.password !== password) return { ok: false, message: t('invalidCredentials') };
    setCurrentUserId(user.id);
    pushToast(t('signedInSuccessfully'));
    return { ok: true, user };
  };

  const logout = () => setCurrentUserId(null);

  const addBooking = (eventId, quantity) => {
    if (!currentUser) {
      pushToast(t('signInFirst'), 'danger');
      return { ok: false, reason: 'auth' };
    }
    if (currentUser.role !== 'attendee') return { ok: false, reason: 'role' };

    const event = events.find((item) => item.id === eventId);
    if (!event) return { ok: false, reason: 'missing' };
    if (event.status !== 'approved') return { ok: false, reason: 'approval' };

    const activeUserTickets = bookings.filter(
      (booking) => booking.userId === currentUser.id && booking.eventId === eventId && booking.status === 'confirmed'
    );
    const alreadyBooked = activeUserTickets.reduce((sum, booking) => sum + booking.quantity, 0);
    if (alreadyBooked + quantity > event.perUserLimit) return { ok: false, reason: 'limit' };

    const available = event.capacity - event.registered;
    if (available < quantity) return { ok: false, reason: 'capacity' };

    const booking = {
      id: randomId('bkg'),
      userId: currentUser.id,
      eventId,
      quantity,
      status: 'confirmed',
      checkedIn: false,
      bookedAt: new Date().toISOString(),
      ticketCode: `TKT-${event.id.replace('evt-', '').toUpperCase()}-${String(bookings.length + 2).padStart(3, '0')}`
    };

    setBookings((prev) => [booking, ...prev]);
    setEvents((prev) => prev.map((item) => (item.id === eventId ? { ...item, registered: item.registered + quantity } : item)));
    pushToast(t('ticketReserved'));
    return { ok: true, booking };
  };

  const cancelBooking = (bookingId) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking || booking.status !== 'confirmed') return;

    setBookings((prev) => prev.map((item) => (item.id === bookingId ? { ...item, status: 'cancelled' } : item)));
    setEvents((prev) =>
      prev.map((item) =>
        item.id === booking.eventId ? { ...item, registered: Math.max(item.registered - booking.quantity, 0) } : item
      )
    );
    pushToast(t('bookingCancelled'), 'warning');
  };

  const saveEventDraft = (form, existingId = null) => {
    const payload = {
      ...defaultNewEvent,
      ...form,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : form.tags,
      organizerId: currentUser?.id || 'u-organizer',
      organizerName: currentUser?.organization || t('organizerAccount'),
      status: form.status || 'draft',
      registrationDeadline: `${form.date || '2026-04-25'}T23:00:00`,
      cancellationDeadline: `${form.date || '2026-04-25'}T18:00:00`,
      isFeatured: false,
      registered: existingId ? events.find((event) => event.id === existingId)?.registered || 0 : 0
    };

    if (existingId) {
      setEvents((prev) => prev.map((event) => (event.id === existingId ? { ...event, ...payload } : event)));
      pushToast(t('eventUpdated'));
      return existingId;
    }

    const eventId = randomId('evt');
    setEvents((prev) => [{ ...payload, id: eventId }, ...prev]);
    pushToast(t('draftSaved'));
    return eventId;
  };

  const submitEventForApproval = (eventId) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, status: 'pending' } : event)));
    pushToast(t('eventSubmitted'), 'warning');
  };

  const reviewEvent = (eventId, decision) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, status: decision === 'approve' ? 'approved' : 'rejected' } : event)));
    pushToast(decision === 'approve' ? t('eventApproved') : t('eventRejected'), decision === 'approve' ? 'success' : 'danger');
  };

  const deleteEvent = (eventId) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
    setBookings((prev) => prev.filter((booking) => booking.eventId !== eventId));
    pushToast(t('eventDeleted'), 'danger');
  };

  const reviewApplication = (applicationId, decision) => {
    const application = applications.find((item) => item.id === applicationId);
    setApplications((prev) => prev.map((item) => (item.id === applicationId ? { ...item, status: decision === 'approve' ? 'approved' : 'rejected' } : item)));

    if (decision === 'approve' && application) {
      setUsers((prev) => [
        ...prev,
        {
          id: randomId('u'),
          name: application.organization,
          email: application.officialEmail,
          password: application.password,
          universityId: `2020${Math.floor(Math.random() * 9000) + 1000}`,
          role: 'organizer',
          organization: application.organization,
          isBanned: false
        }
      ]);
    }

    pushToast(decision === 'approve' ? t('applicationApproved') : t('applicationRejected'), decision === 'approve' ? 'success' : 'danger');
  };

  const updateUserRole = (userId, role) => {
    if (userId === currentUserId && currentUser?.role === 'admin' && role !== 'admin') {
      pushToast(t('adminCannotDemote'), 'danger');
      return;
    }
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
    pushToast(t('userRoleUpdated'));
  };

  const toggleBanUser = (userId) => {
    if (userId === currentUserId) {
      pushToast(t('adminCannotBanSelf'), 'danger');
      return;
    }
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, isBanned: !user.isBanned } : user)));
    pushToast(t('userStatusUpdated'), 'warning');
  };

  const submitOrganizerApplication = (form) => {
    setApplications((prev) => [
      {
        id: randomId('app'),
        applicantName: form.organization,
        organization: form.organization,
        type: form.type,
        officialEmail: form.officialEmail,
        advisorName: form.advisorName,
        documentName: form.documentName || 'verification.pdf',
        submittedAt: '2026-04-10',
        status: 'pending',
        password: form.password,
        notes: form.notes || ''
      },
      ...prev
    ]);
    pushToast(t('organizerApplicationSubmitted'));
  };

  const checkInBooking = (bookingId) => {
    setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, checkedIn: true } : booking)));
    pushToast(t('checkedInSuccess'));
  };

  const analytics = useMemo(() => {
    const approvedEvents = events.filter((event) => event.status === 'approved');
    return {
      pendingEvents: events.filter((event) => event.status === 'pending').length,
      pendingApplications: applications.filter((app) => app.status === 'pending').length,
      totalUsers: users.length,
      activeEvents: approvedEvents.length,
      totalEvents: events.length,
      organizerDrafts: organizerEvents.filter((event) => event.status === 'draft').length,
      organizerPending: organizerEvents.filter((event) => event.status === 'pending').length,
      organizerRegistrations: organizerEvents.reduce((sum, event) => sum + event.registered, 0),
      attendeeUpcoming: userBookings.filter((booking) => {
        const event = events.find((item) => item.id === booking.eventId);
        return event && !isPastEvent(event) && booking.status === 'confirmed';
      }).length,
      attendeePast: userBookings.filter((booking) => {
        const event = events.find((item) => item.id === booking.eventId);
        return event && isPastEvent(event) && booking.status === 'confirmed';
      }).length
    };
  }, [applications, events, organizerEvents, userBookings, users]);

  const value = {
    categories,
    users,
    events,
    bookings,
    applications,
    currentUser,
    visibleEvents,
    userBookings,
    organizerEvents,
    analytics,
    toast,
    login,
    loginAs,
    logout,
    addBooking,
    cancelBooking,
    saveEventDraft,
    submitEventForApproval,
    reviewEvent,
    deleteEvent,
    reviewApplication,
    updateUserRole,
    toggleBanUser,
    submitOrganizerApplication,
    checkInBooking,
    pushToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
};
