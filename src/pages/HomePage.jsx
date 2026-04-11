import { useMemo, useState } from 'react';
import EventCard from '../components/EventCard';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const { categories, visibleEvents, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');

  const filteredEvents = useMemo(() => {
    return visibleEvents.filter((event) => {
      const matchesSearch = [event.title, event.description, event.organizerName, ...(event.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory = category === 'All Categories' || event.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, search, visibleEvents]);


  return (
    <div>
      {currentUser?.role === 'attendee' && (
        <section className="hero-banner">
          <div className="shell">
            <h1>Discover KFUPM Events</h1>
            <p>Your central hub for all university events, workshops, and activities</p>
            <div className="search-bar large">
              <span>🔎</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events..."
              />
            </div>
          </div>
        </section>
      )}

      <section className="shell page-section">
        <div className="filter-row">
          <div className="filter-label">Filters:</div>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All Categories</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or tag" />
        </div>

        {filteredEvents.length === 0 ? (
          <div className="empty-card">
            <h3>No events found</h3>
            <p>Try clearing filters or using another keyword.</p>
          </div>
        ) : (
          <div className="card-grid three-col">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
