import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatShortDate, getLocale } from '../utils/helpers';

const browserTabs = [
  { id: 'all', labelKey: 'allEvents' },
  { id: 'today', labelKey: 'today' },
  { id: 'weekend', labelKey: 'thisWeekend' },
  { id: 'month', labelKey: 'thisMonth' },
  { id: 'festival', labelKey: 'festival' }
];

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const matchesDateTab = (event, tab) => {
  if (tab === 'all') return true;
  if (tab === 'festival') {
    return event.category === 'Cultural' || event.tags?.some((tag) => tag.toLowerCase().includes('festival'));
  }

  const eventDate = startOfDay(`${event.date}T00:00:00`);
  const today = startOfDay(new Date());

  if (tab === 'today') {
    return eventDate.getTime() === today.getTime();
  }

  if (tab === 'weekend') {
    const day = today.getDay();
    const friday = new Date(today);
    friday.setDate(today.getDate() + ((5 - day + 7) % 7));
    const saturday = new Date(friday);
    saturday.setDate(friday.getDate() + 1);
    return eventDate >= friday && eventDate <= saturday;
  }

  if (tab === 'month') {
    return eventDate.getFullYear() === today.getFullYear() && eventDate.getMonth() === today.getMonth();
  }

  return true;
};

export default function HomePage() {
  const { categories, visibleEvents, currentUser } = useApp();
  const { categoryLabel, eventText, language, t, toggleLanguage } = useLanguage();
  const eventsRailRef = useRef(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('All Venues');
  const [browserTab, setBrowserTab] = useState('all');

  const venueOptions = useMemo(() => {
    const seen = new Set();
    return visibleEvents.filter((event) => {
      if (seen.has(event.location)) return false;
      seen.add(event.location);
      return true;
    });
  }, [visibleEvents]);

  const filteredEvents = useMemo(() => {
    return visibleEvents.filter((event) => {
      const matchesSearch = [
        event.title,
        event.description,
        event.organizerName,
        eventText(event, 'title'),
        eventText(event, 'description'),
        eventText(event, 'organizerName'),
        ...(event.tags || [])
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory = category === 'All Categories' || event.category === category;
      const matchesDate = !date || event.date === date;
      const matchesVenue = venue === 'All Venues' || event.location === venue;
      return matchesSearch && matchesCategory && matchesDate && matchesVenue && matchesDateTab(event, browserTab);
    });
  }, [browserTab, category, date, eventText, search, venue, visibleEvents]);

  const showHero = !currentUser || currentUser.role === 'attendee';
  const featuredEvent = visibleEvents.find((event) => event.isFeatured) || visibleEvents[0];
  const dateFormatterLocale = getLocale(language);

  const submitHeroSearch = (event) => {
    event.preventDefault();
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBrowserTab = (tab) => {
    setBrowserTab(tab);
    if (tab === 'festival') setCategory('All Categories');
    setDate('');
  };

  const scrollEvents = (amount) => {
    const rail = eventsRailRef.current;
    if (!rail) return;
    rail.scrollBy({ left: language === 'ar' ? -amount : amount, behavior: 'smooth' });
  };

  const getDateParts = (eventDate) => {
    const value = new Date(`${eventDate}T00:00:00`);
    return {
      weekday: new Intl.DateTimeFormat(dateFormatterLocale, { weekday: 'short' }).format(value),
      day: new Intl.DateTimeFormat(dateFormatterLocale, { day: '2-digit' }).format(value),
      monthYear: new Intl.DateTimeFormat(dateFormatterLocale, { month: 'short', year: '2-digit' }).format(value)
    };
  };

  return (
    <div>
      {showHero && (
        <section className="hero-banner">
          <div className="shell hero-shell">
            <div className="hero-topbar">
              <div className="hero-mark" aria-label={t('appName')}>
                <span />
                <span />
                <span />
              </div>
              <div className="hero-nav-pills" aria-label={t('eventShortcuts')}>
                <button type="button" onClick={() => setCategory('All Categories')}>{t('allEvents')}</button>
                <button type="button" onClick={() => setCategory('Workshop')}>{t('workshops')}</button>
                <button type="button" onClick={() => setCategory('Career')}>{t('career')}</button>
                <button type="button" onClick={() => setCategory('Cultural')}>{t('cultural')}</button>
              </div>
              <button className="language-toggle hero-language-toggle" type="button" onClick={toggleLanguage}>
                {language === 'en' ? 'AR' : 'EN'}
              </button>
              <Link className="hero-join" to={currentUser ? '/tickets' : '/login'}>
                {currentUser ? t('myTickets') : t('joinUs')}
              </Link>
            </div>

            <div className="hero-content">
              <div className="hero-copy">
                <span className="hero-kicker">{t('heroKicker')}</span>
                <h1>{t('heroTitle')}</h1>

                <form className="hero-search-panel" onSubmit={submitHeroSearch}>
                  <label className="hero-search-field hero-search-main">
                    <span>{t('searchByEventVenue')}</span>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={t('searchPlaceholder')}
                    />
                  </label>
                  <label className="hero-search-field">
                    <span>{t('category')}</span>
                    <select value={category} onChange={(event) => setCategory(event.target.value)}>
                      <option value="All Categories">{t('allCategories')}</option>
                      {categories.map((item) => (
                        <option key={item} value={item}>{categoryLabel(item)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="hero-search-field">
                    <span>{t('selectDate')}</span>
                    <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                  </label>
                  <button className="hero-search-button" type="submit">
                    {t('search')}
                  </button>
                </form>
              </div>

              {featuredEvent && (
                <Link className="hero-feature-card" to={`/events/${featuredEvent.id}`}>
                  <div className={`hero-feature-thumb ${featuredEvent.coverTheme}`} />
                  <div>
                    <span>{t('featuredEvent')}</span>
                    <strong>{eventText(featuredEvent, 'title')}</strong>
                    <small>{formatShortDate(featuredEvent.date, language)} / {eventText(featuredEvent, 'location')}</small>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="shell page-section events-browser-section" id="events">
        <div className="events-browser-head">
          <div className="events-browser-title">
            <h2>{t('browsingEventsIn')}</h2>
            <select className="events-venue-select" value={venue} onChange={(event) => setVenue(event.target.value)}>
              <option value="All Venues">{t('allVenues')}</option>
              {venueOptions.map((event) => (
                <option key={event.location} value={event.location}>{eventText(event, 'location')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="events-browser-tabs" aria-label={t('eventBrowser')}>
          {browserTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={browserTab === tab.id ? 'active' : ''}
              onClick={() => handleBrowserTab(tab.id)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="empty-card">
            <h3>{t('noEventsFound')}</h3>
            <p>{t('noEventsHint')}</p>
          </div>
        ) : (
          <>
            <div className="events-browser-rail" ref={eventsRailRef}>
              {filteredEvents.map((event) => {
                const dateParts = getDateParts(event.date);
                const imageStyle = event.imageData ? { backgroundImage: `url(${event.imageData})` } : undefined;

                return (
                  <article className="browse-event-card" key={event.id}>
                    <Link
                      className={`browse-event-art ${event.coverTheme} ${event.imageData ? 'browse-event-art-uploaded' : ''}`}
                      style={imageStyle}
                      to={`/events/${event.id}`}
                      aria-label={eventText(event, 'title')}
                    />
                    <div className="browse-event-body">
                      <div className="browse-event-date" aria-label={formatShortDate(event.date, language)}>
                        <span>{dateParts.weekday}</span>
                        <strong>{dateParts.day}</strong>
                        <small>{dateParts.monthYear}</small>
                      </div>
                      <div className="browse-event-copy">
                        <h3>
                          <Link to={`/events/${event.id}`}>{eventText(event, 'title')}</Link>
                        </h3>
                        <p>{t('organizedBy')} {eventText(event, 'organizerName')}</p>
                        <div className="browse-event-chips">
                          <span>{categoryLabel(event.category)}</span>
                          <span>{eventText(event, 'location')}</span>
                        </div>
                        <Link className="browse-ticket-button" to={`/events/${event.id}`}>
                          {t('findTickets')} <span aria-hidden="true">{language === 'ar' ? '<-' : '->'}</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="events-browser-footer">
              <div className="events-browser-dots" aria-hidden="true">
                <span className="active" />
                <span />
              </div>
              <div className="events-browser-controls">
                <button type="button" onClick={() => scrollEvents(-340)} aria-label={t('previousEvents')}>
                  {'<'}
                </button>
                <button type="button" onClick={() => scrollEvents(340)} aria-label={t('nextEvents')}>
                  {'>'}
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
