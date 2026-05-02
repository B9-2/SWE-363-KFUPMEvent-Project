import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatShortDate } from '../utils/helpers';

export default function HomePage() {
  const { categories, visibleEvents, currentUser } = useApp();
  const { categoryLabel, eventText, language, t, toggleLanguage } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [date, setDate] = useState('');

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
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [category, date, eventText, search, visibleEvents]);

  const showHero = !currentUser || currentUser.role === 'attendee';
  const featuredEvent = visibleEvents.find((event) => event.isFeatured) || visibleEvents[0];

  const submitHeroSearch = (event) => {
    event.preventDefault();
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
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

      <section className="shell page-section" id="events">
        <div className="filter-row">
          <div className="filter-label">{t('filters')}</div>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="All Categories">{t('allCategories')}</option>
            {categories.map((item) => (
              <option key={item} value={item}>{categoryLabel(item)}</option>
            ))}
          </select>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchByTitle')} />
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>

        {filteredEvents.length === 0 ? (
          <div className="empty-card">
            <h3>{t('noEventsFound')}</h3>
            <p>{t('noEventsHint')}</p>
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
