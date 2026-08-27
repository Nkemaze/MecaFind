import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from './Icon';

const CAMEROON_CENTER = [3.848, 11.498];

const markerIcon = L.divIcon({
  className: '', iconSize: [32, 32], iconAnchor: [16, 32],
  html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:#0047c1;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3)"><div style="width:10px;height:10px;background:#fff;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)"></div></div>`,
});

function ClickHandler({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1.2 });
  }, [position, map]);
  return null;
}

function SearchBox({ onResult }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Yaoundé, Cameroon')}&limit=6`, {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      setResults(data);
      setOpen(true);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }

  function pick(r) {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    onResult(lat, lon, r.display_name);
    setQuery(r.display_name.split(',')[0]);
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icon name="search" size="text-[18px]" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
            placeholder="Search for a location..."
            className="w-full h-11 pl-10 pr-4 bg-white rounded-xl text-sm ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40 transition-all"
          />
        </div>
        <button onClick={search} disabled={searching}
          className="h-11 px-5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5">
          {searching ? <Icon name="progress_activity" size="text-[16px]" className="animate-spin" /> : <Icon name="search" size="text-[16px]" />}
          Search
        </button>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl ring-1 ring-outline-variant/20 py-2 z-50 max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <button key={i} onClick={() => pick(r)}
              className="w-full text-left px-4 py-2.5 hover:bg-surface-container-low transition-colors flex items-start gap-3">
              <Icon name="location_on" size="text-[16px]" className="text-primary mt-0.5 shrink-0" />
              <span className="text-xs text-on-surface leading-relaxed">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LocationPickerModal({ open, onClose, initialLat, initialLng, onConfirm }) {
  const [picked, setPicked] = useState(null);
  const [address, setAddress] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);

  useEffect(() => {
    if (open) {
      if (initialLat && initialLng) {
        setPicked([parseFloat(initialLat), parseFloat(initialLng)]);
      } else {
        setPicked(CAMEROON_CENTER);
      }
      setAddress('');
      setFlyTarget(null);
    }
  }, [open, initialLat, initialLng]);

  const handleMapPick = useCallback((lat, lng) => {
    setPicked([lat, lng]);
  }, []);

  const handleSearchResult = useCallback((lat, lon, name) => {
    setPicked([lat, lon]);
    setFlyTarget([lat, lon]);
    setAddress(name);
  }, []);

  function reverseGeocode(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then((r) => r.json())
      .then((data) => { if (data.display_name) setAddress(data.display_name); })
      .catch(() => {});
  }

  useEffect(() => {
    if (picked && !address) {
      const timer = setTimeout(() => reverseGeocode(picked[0], picked[1]), 500);
      return () => clearTimeout(timer);
    }
  }, [picked]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-outline-variant/30 px-4 py-3 flex items-center gap-3">
        <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-surface-container-low flex items-center justify-center transition-colors shrink-0">
          <Icon name="close" size="text-[22px]" className="text-on-surface" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-on-surface">Select Workshop Location</h2>
          <p className="text-[11px] text-on-surface-variant">Search or tap on the map to pick a location</p>
        </div>
        <button onClick={() => { if (picked) onConfirm(picked[0], picked[1], address); }}
          disabled={!picked}
          className="h-10 px-5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5">
          <Icon name="check" size="text-[16px]" /> Confirm
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 px-4 py-3 bg-white border-b border-outline-variant/20">
        <SearchBox onResult={handleSearchResult} />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={picked || CAMEROON_CENTER}
          zoom={13}
          className="h-full w-full"
          style={{ height: '100%' }}
        >
          <TileLayer attribution='&copy; <a href="https://openstreetmap.org">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onPick={(lat, lng) => { handleMapPick(lat, lng); setAddress(''); }} />
          {flyTarget && <FlyTo position={flyTarget} />}
          {picked && <Marker position={picked} icon={markerIcon} />}
        </MapContainer>

        {/* Center crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[400]">
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-lg" />
          </div>
        </div>

        {/* Picked address */}
        {address && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-xl p-4 z-[400] flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="location_on" size="text-[18px]" className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-0.5">Selected Location</p>
              <p className="text-xs text-on-surface leading-relaxed">{address}</p>
              {picked && (
                <p className="text-[10px] text-on-surface-variant mt-1">{picked[0].toFixed(6)}, {picked[1].toFixed(6)}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
