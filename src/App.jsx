import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import OrganizerLayout from "./layouts/OrganizerLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Events from "./pages/Event.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import Booking from "./pages/Booking.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import MyTickets from "./pages/MyTickets.jsx";

import Dashboard from "./pages/Organizer/Dashboard.jsx";
import CreateEvent from "./pages/Organizer/CreateEvent.jsx";
import ManageEvent from "./pages/Organizer/ManageEvent.jsx";
import Registrations from "./pages/Organizer/Registrations.jsx";
import CheckIn from "./pages/Organizer/CheckIn.jsx";

import ReviewEvents from "./pages/Admin/ReviewEvents.jsx";
import ManageUsers from "./pages/Admin/ManageUsers.jsx";
import Applications from "./pages/Admin/Applications.jsx";
import Analytics from "./pages/Admin/Analytics.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/confirmation/:id" element={<Confirmation />} />
          <Route path="/my-tickets" element={<MyTickets />} />
        </Route>

        <Route path="/organizer" element={<OrganizerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="manage-event/:id" element={<ManageEvent />} />
          <Route path="registrations/:id" element={<Registrations />} />
          <Route path="check-in/:id" element={<CheckIn />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ReviewEvents />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="applications" element={<Applications />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;