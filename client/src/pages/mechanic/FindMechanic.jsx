import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Icon from '../../components/Icon';
import { useAuth } from '../../context/AuthContext';

export default function FindMechanic() {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(15);
  const [activeFilter, setActiveFilter] = useState('All Services');
  const [locationNotice, setLocationNotice] = useState('');
  const [error, setError] = useState('');
  const [locationMode, setLocationMode] = useState('current');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const loadYaoundeFallback = () => {
      const fallback = { lat: 3.848, lng: 11.498 };
      setLocationNotice('Location access was not available. Showing approved workshops around central Yaoundé.');
      setLocation(fallback);
      fetchMechanics(fallback);
    };
    if (!navigator.geolocation) {
      loadYaoundeFallback();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocationMode('current');
        setLocationNotice('Showing workshops near your current location. You can switch to central Yaoundé below.');
        setLocation(loc);
        fetchMechanics(loc);
      },
      loadYaoundeFallback,
    );
  }, [user]);

  async function fetchMechanics(loc, searchQuery = query, service = activeFilter, searchRadius = radius) {
    setLoading(true);
    setError('');
    try {
      const params = { lat: loc.lat, lng: loc.lng, radius: searchRadius };
      if (searchQuery) params.q = searchQuery;
      if (service && service !== 'All Services') params.service = service;
      const { data } = await api.get('/mechanics/nearby', { params });
      setMechanics(data.mechanics || []);
    } catch (requestError) {
      setMechanics([]);
      setError(requestError.response?.data?.message || 'We could not load nearby mechanics. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (location) fetchMechanics(location, query, activeFilter);
  }

  function handleFilterClick(filter) {
    setActiveFilter(filter);
    if (location) fetchMechanics(location, query, filter);
  }

  function searchCentralYaounde() {
    const yaounde = { lat: 3.848, lng: 11.498 };
    setLocationMode('yaounde');
    setLocationNotice('Showing approved workshops around central Yaoundé.');
    setLocation(yaounde);
    fetchMechanics(yaounde);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationNotice('Your browser cannot provide a location. Showing central Yaoundé instead.');
      searchCentralYaounde();
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const current = { lat: position.coords.latitude, lng: position.coords.longitude };
        setLocationMode('current');
        setLocationNotice('Showing workshops near your current location.');
        setLocation(current);
        fetchMechanics(current);
      },
      () => searchCentralYaounde(),
    );
  }

  function changeRadius(value) {
    const nextRadius = Number(value);
    setRadius(nextRadius);
    if (location) fetchMechanics(location, query, activeFilter, nextRadius);
  }

  if (!user) {
    return (
      <main className="pt-20 min-h-screen bg-background flex items-center justify-center px-5">
        <div className="max-w-md text-center bg-white rounded-2xl border border-outline-variant/30 p-8">
          <Icon name="lock" size="text-[48px]" className="text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-on-surface mb-2">Sign in to find mechanics</h1>
          <p className="text-on-surface-variant mb-6">Your account lets us use your location and protect your direction-use balance.</p>
          <Link to="/auth/signin" className="inline-flex px-5 py-3 rounded-lg bg-primary text-on-primary font-semibold">Sign in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-16 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-on-background tracking-tight mb-2">Find a Mechanic</h1>
          <p className="text-lg text-on-surface-variant">Discover verified workshops near you in Yaoundé.</p>
        </div>

        <div className="mb-6 rounded-xl border border-outline-variant/40 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">Search area</p>
              <p className="text-xs text-on-surface-variant mt-1">
                {locationMode === 'yaounde' ? 'Central Yaoundé' : 'Your current location'} · within {radius} km
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={useCurrentLocation} className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${locationMode === 'current' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface hover:bg-surface-container-low'}`}>
                <Icon name="my_location" size="text-[16px]" className="mr-1" /> Current location
              </button>
              <button onClick={searchCentralYaounde} className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${locationMode === 'yaounde' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface hover:bg-surface-container-low'}`}>
                <Icon name="location_city" size="text-[16px]" className="mr-1" /> Central Yaoundé
              </button>
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface">
                Radius
                <select value={radius} onChange={(event) => changeRadius(event.target.value)} className="bg-transparent font-semibold focus:outline-none">
                  {[5, 15, 30, 50].map((value) => <option key={value} value={value}>{value} km</option>)}
                </select>
              </label>
            </div>
          </div>
          {locationNotice && <p className="mt-3 flex gap-2 text-xs text-on-surface-variant"><Icon name="info" size="text-[16px]" className="text-primary shrink-0" />{locationNotice}</p>}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex items-center bg-white rounded-full shadow-md border border-outline-variant/30 overflow-hidden max-w-2xl">
            <div className="pl-5 pr-2"><Icon name="search" className="text-outline" /></div>
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, service, or area..."
              className="flex-1 h-14 bg-transparent text-base text-on-surface placeholder:text-outline focus:outline-none px-2"
            />
            <button type="submit" className="bg-primary text-white px-6 h-14 font-semibold text-sm hover:bg-primary-container transition-all">
              Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All Services', 'Engine Repair', 'Diagnostics', 'Tyre Service', 'Electrical', 'Body Work', 'Oil Change'].map((f) => (
            <button
              key={f}
              onClick={() => handleFilterClick(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeFilter === f
                  ? 'bg-primary text-on-primary border-primary'
                  : 'border-outline-variant bg-white text-on-surface-variant hover:bg-primary/5 hover:text-primary hover:border-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
            <Icon name="progress_activity" size="text-[48px]" className="animate-spin mb-4 text-primary" />
            <p className="text-base font-medium">Finding nearby mechanics...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Icon name="error_outline" size="text-[64px]" className="text-error mb-4" />
            <h3 className="text-xl font-semibold text-on-surface mb-2">Could not load mechanics</h3>
            <p className="text-base text-on-surface-variant max-w-md mb-5">{error}</p>
            <button onClick={() => location && fetchMechanics(location)} className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold">Try again</button>
          </div>
        ) : mechanics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Icon name="search_off" size="text-[64px]" className="text-outline-variant mb-4" />
            <h3 className="text-xl font-semibold text-on-surface mb-2">No mechanics found</h3>
            <p className="text-base text-on-surface-variant max-w-md mb-5">Try increasing the radius, changing the service filter, or searching central Yaoundé.</p>
            {locationMode === 'current' && <button onClick={searchCentralYaounde} className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold">Search central Yaoundé</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mechanics.map((m) => (
              <Link
                key={m.id}
                to={`/mechanics/${m.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-outline-variant/30"
              >
                <div className="h-40 bg-surface-container-high flex items-center justify-center">
                  {m.photos?.[0]?.imageUrl ? <img src={m.photos[0].imageUrl} alt={`${m.workshopName} workshop`} className="w-full h-full object-cover" /> : <Icon name="build" className="text-on-surface-variant opacity-30" size="text-[48px]" />}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-on-surface">{m.workshopName}</h3>
                      <span className="bg-[#E6F4EA] text-[#1E7E34] text-[10px] px-2 py-1 rounded-full font-semibold uppercase flex items-center gap-1">
                        <Icon name="verified" size="text-[12px]" /> Verified
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <Icon name="star" size="text-[16px]" className="text-tertiary-container" />
                    <span className="text-sm font-semibold text-on-surface">{m.isOpen ? 'Open Now' : 'Closed'}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${m.isOpen ? 'bg-[#E6F4EA] text-[#1E7E34]' : 'bg-error-container/30 text-error'}`}>
                      {m.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-2">
                    <Icon name="location_on" size="text-[14px]" className="mr-1" />
                    {m.distanceKm ? `${m.distanceKm.toFixed(1)} km away` : 'Distance unknown'}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(m.services || []).slice(0, 3).map((s) => (
                      <span key={s.serviceName} className="bg-surface-container px-2 py-1 rounded text-xs text-on-surface-variant">{s.serviceName}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <span className="flex-1 text-center py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:bg-primary-container transition-all">
                      Get Directions
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
