import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import Icon from '../../components/Icon';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#0047c1;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;border-radius:50%;background:#fff"></div></div>',
});

const workshopIcon = L.divIcon({
  className: '',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  html: `<div style="width:32px;height:40px;display:flex;flex-direction:column;align-items:center">
    <div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:#ea580c;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
      <span style="transform:rotate(45deg);color:#fff;font-size:16px">&#128295;</span>
    </div>
  </div>`,
});

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  return null;
}

export default function Directions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requestId] = useState(() => searchParams.get('request') || crypto.randomUUID());
  const [mechanic, setMechanic] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);
  const [routeError, setRouteError] = useState(false);
  const [usageRequired, setUsageRequired] = useState(false);

  useEffect(() => {
    if (!searchParams.get('request')) setSearchParams({ request: requestId }, { replace: true });
  }, [requestId, searchParams, setSearchParams]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLoc({ lat: 3.848, lng: 11.498 })
    );
  }, []);

  useEffect(() => {
    if (!userLoc) return;
    let cancelled = false;
    api.get(`/mechanics/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setMechanic(data.mechanic);
        if (data.mechanic.latitude && data.mechanic.longitude) {
          return fetch(
            `https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${data.mechanic.longitude},${data.mechanic.latitude}?overview=full&geometries=geojson&steps=true`
          );
        }
      })
      .then((res) => res?.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.routes?.[0]) throw new Error('No driving route was returned.');
        return api.post(`/usage/mechanics/${id}/directions-use`, { requestId })
          .then(() => data.routes[0]);
      })
      .then((successfulRoute) => { if (!cancelled) setRoute(successfulRoute); })
      .catch((error) => {
        if (cancelled) return;
        if (error.response?.status === 402) setUsageRequired(true);
        else setRouteError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, requestId, userLoc]);

  const routeCoords = useMemo(() => {
    if (!route?.legs?.[0]?.steps) return [];
    const coords = [];
    for (const step of route.legs[0].steps) {
      if (step.geometry?.coordinates) {
        for (const [lng, lat] of step.geometry.coordinates) {
          coords.push([lat, lng]);
        }
      }
    }
    return coords;
  }, [route]);

  const mapCenter = useMemo(() => {
    if (userLoc && mechanic?.latitude && mechanic?.longitude) {
      return [(userLoc.lat + mechanic.latitude) / 2, (userLoc.lng + mechanic.longitude) / 2];
    }
    return userLoc ? [userLoc.lat, userLoc.lng] : [3.848, 11.498];
  }, [userLoc, mechanic]);

  const markerPositions = useMemo(() => {
    const positions = [];
    if (userLoc) positions.push([userLoc.lat, userLoc.lng]);
    if (mechanic?.latitude && mechanic?.longitude) positions.push([mechanic.latitude, mechanic.longitude]);
    return positions;
  }, [userLoc, mechanic]);

  const straightLineDistanceKm = useMemo(() => {
    if (!userLoc || !mechanic?.latitude || !mechanic?.longitude) return null;
    const radians = (value) => value * Math.PI / 180;
    const latDelta = radians(mechanic.latitude - userLoc.lat);
    const lngDelta = radians(mechanic.longitude - userLoc.lng);
    const a = Math.sin(latDelta / 2) ** 2 + Math.cos(radians(userLoc.lat)) * Math.cos(radians(mechanic.latitude)) * Math.sin(lngDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, [userLoc, mechanic]);

  if (loading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="progress_activity" size="text-[48px]" className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant font-medium">Calculating route...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Map */}
      <div className="flex-1 relative min-h-[400px] lg:min-h-0">
        {userLoc ? (
          <MapContainer center={mapCenter} zoom={13} className="h-full w-full" style={{ minHeight: '400px' }} zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds positions={markerPositions} />
            <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
              <div className="font-semibold text-sm">Your Location</div>
            </Marker>
            {mechanic?.latitude && mechanic?.longitude && (
              <Marker position={[mechanic.latitude, mechanic.longitude]} icon={workshopIcon}>
                <div className="font-semibold text-sm">{mechanic.workshopName}</div>
              </Marker>
            )}
            {routeCoords.length > 0 && (
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: '#0047c1', weight: 5, opacity: 0.8, dashArray: null }}
              />
            )}
            {routeError && markerPositions.length === 2 && <Polyline positions={markerPositions} pathOptions={{ color: '#737687', weight: 3, dashArray: '8 8' }} />}
          </MapContainer>
        ) : (
          <div className="h-full w-full bg-surface-container-high flex items-center justify-center">
            <div className="text-center text-on-surface-variant">
              <Icon name="my_location" size="text-[48px]" className="mx-auto mb-3" />
              <p className="font-medium">Waiting for location access...</p>
            </div>
          </div>
        )}
      </div>

      {/* Route Info Panel */}
      <div className="w-full lg:w-[400px] bg-white border-l border-outline-variant p-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-on-surface mb-1">Directions</h2>
          {mechanic && (
            <p className="text-sm text-on-surface-variant">
              To: <span className="font-medium text-on-surface">{mechanic.workshopName}</span>
            </p>
          )}
          {mechanic?.address && (
            <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <Icon name="location_on" size="text-[14px]" /> {mechanic.address}, {mechanic.city}
            </p>
          )}
        </div>

        {route ? (
          <>
            <div className="flex gap-3 mb-6">
              <div className="flex-1 bg-surface-container-low rounded-xl p-4 text-center">
                <Icon name="straighten" className="text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-on-surface">{(route.distance / 1000).toFixed(1)} km</p>
                <p className="text-xs text-on-surface-variant">Distance</p>
              </div>
              <div className="flex-1 bg-surface-container-low rounded-xl p-4 text-center">
                <Icon name="schedule" className="text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-on-surface">{Math.ceil(route.duration / 60)} min</p>
                <p className="text-xs text-on-surface-variant">Est. Time</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/30">
              <Icon name="info" size="text-[16px]" className="text-on-surface-variant" />
              <span className="text-xs text-on-surface-variant">Driving route via OSRM</span>
            </div>

            <h3 className="text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Turn-by-Turn</h3>
            <div className="space-y-2">
              {route.legs?.[0]?.steps?.map((step, i) => {
                const icon = step.maneuver?.type === 'turn' ? 'turn_right' :
                  step.maneuver?.type === 'depart' ? 'play_arrow' :
                  step.maneuver?.type === 'arrive' ? 'flag' : 'straighten';
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${i === route.legs[0].steps.length - 1 ? 'bg-primary-fixed' : 'bg-surface-container-low'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${i === route.legs[0].steps.length - 1 ? 'bg-[#1E7E34]' : 'bg-primary'}`}>
                      <Icon name={icon} size="text-[16px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-on-surface font-medium truncate">
                        {step.maneuver?.modifier ? `${step.maneuver.modifier.charAt(0).toUpperCase() + step.maneuver.modifier.slice(1)} ` : ''}
                        {step.name || 'Continue'}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{(step.distance / 1000).toFixed(1)} km</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : usageRequired ? (
          <div className="text-center py-12">
            <Icon name="account_balance_wallet" size="text-[48px]" className="text-primary mx-auto mb-3" />
            <p className="text-sm font-medium text-on-surface mb-1">You need a direction use</p>
            <p className="text-xs text-on-surface-variant mb-4">Buy a 5-use package and wait for administrator confirmation to continue.</p>
            <button onClick={() => navigate('/usage')} className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold">View usage</button>
          </div>
        ) : routeError ? (
          <div className="text-center py-12">
            <Icon name="error_outline" size="text-[48px]" className="text-error mx-auto mb-3" />
            <p className="text-sm font-medium text-on-surface mb-1">Unable to calculate route</p>
            <p className="text-xs text-on-surface-variant">The routing service may be temporarily unavailable. No use was deducted.</p>
            {straightLineDistanceKm !== null && <p className="text-sm font-semibold text-on-surface mt-4">Straight-line distance: {straightLineDistanceKm.toFixed(1)} km</p>}
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon name="route" size="text-[48px]" className="text-outline-variant mx-auto mb-3" />
            <p className="text-sm text-on-surface-variant">Calculating route...</p>
          </div>
        )}
      </div>
    </main>
  );
}
