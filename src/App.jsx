import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import OrganizerLayout from "./layouts/OrganizerLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import MyTickets from "./pages/MyTickets";

import Dashboard from "./pages/Organizer/Dashboard";
import CreateEvent from "./pages/Organizer/CreateEvent";
import ManageEvent from "./pages/Organizer/ManageEvent";
import Registrations from "./pages/Organizer/Registrations";
import CheckIn from "./pages/Organizer/CheckIn";

import ReviewEvents from "./pages/Admin/ReviewEvents";
import ManageUsers from "./pages/Admin/ManageUsers";
import Applications from "./pages/Admin/Applications";
import Analytics from "./pages/Admin/Analytics";

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