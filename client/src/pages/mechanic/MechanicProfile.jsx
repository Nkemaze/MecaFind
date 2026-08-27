import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Icon from '../../components/Icon';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MechanicProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mechanic, setMechanic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/mechanics/${id}`)
      .then(({ data }) => setMechanic(data.mechanic))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDirections() {
    if (!user) { navigate('/auth/signin'); return; }
    const requestId = crypto.randomUUID();
    navigate(`/directions/${id}?request=${requestId}`);
  }

  if (loading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <Icon name="progress_activity" size="text-[48px]" className="animate-spin text-primary" />
      </main>
    );
  }

  if (!mechanic) {
    return (
      <main className="pt-20 min-h-screen flex flex-col items-center justify-center text-center px-5">
        <Icon name="error_outline" size="text-[64px]" className="text-outline-variant mb-4" />
        <h2 className="text-2xl font-semibold text-on-surface mb-2">Mechanic Not Found</h2>
        <p className="text-on-surface-variant">This workshop may have been removed or is not yet approved.</p>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-16 py-8">
        {/* Cover */}
        <div className="w-full h-64 bg-surface-container-high rounded-2xl overflow-hidden mb-8 flex items-center justify-center">
          {mechanic.photos?.[0]?.imageUrl ? (
            <img src={mechanic.photos[0].imageUrl} alt={`${mechanic.workshopName} workshop`} className="w-full h-full object-cover" />
          ) : <Icon name="storefront" size="text-[80px]" className="text-on-surface-variant opacity-20" />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-on-surface">{mechanic.workshopName}</h1>
              <span className="bg-[#E6F4EA] text-[#1E7E34] text-xs px-2 py-1 rounded-full font-semibold uppercase flex items-center gap-1">
                <Icon name="verified" size="text-[14px]" /> Verified
              </span>
            </div>
            <p className="text-base text-on-surface-variant mb-4">{mechanic.mechanicName}</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Icon name="location_on" size="text-[18px]" className="text-primary" />
                <span className="text-sm text-on-surface">{mechanic.address}, {mechanic.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="phone" size="text-[18px]" className="text-primary" />
                <span className="text-sm text-on-surface">{mechanic.phone}</span>
              </div>
            </div>

            {mechanic.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-on-surface mb-2">About</h2>
                <p className="text-base text-on-surface-variant leading-relaxed">{mechanic.description}</p>
              </div>
            )}

            {mechanic.photos?.length > 1 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-on-surface mb-3">Workshop Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mechanic.photos.slice(1).map((photo) => <img key={photo.id} src={photo.imageUrl} alt={`${mechanic.workshopName} workshop`} className="aspect-square rounded-xl object-cover" />)}
                </div>
              </div>
            )}

            {/* Services */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-on-surface mb-3">Services Offered</h2>
              <div className="flex flex-wrap gap-2">
                {(mechanic.services || []).map((s) => (
                  <span key={s.serviceName} className="bg-primary-fixed text-primary px-3 py-2 rounded-lg text-sm font-medium">{s.serviceName}</span>
                ))}
              </div>
            </div>

            {/* Car Brands */}
            {mechanic.carBrands?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-on-surface mb-3">Car Brands Serviced</h2>
                <div className="flex flex-wrap gap-2">
                  {mechanic.carBrands.map((b) => (
                    <span key={b.brandName} className="bg-surface-container px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant">{b.brandName}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Hours */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-on-surface mb-3">Operating Hours</h2>
              <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden">
                {(mechanic.hours || []).map((h) => (
                  <div key={h.dayOfWeek} className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/20 last:border-0">
                    <span className="text-sm font-medium text-on-surface">{dayNames[h.dayOfWeek]}</span>
                    <span className={`text-sm font-medium ${h.isClosed ? 'text-error' : 'text-on-surface-variant'}`}>
                      {h.isClosed ? 'Closed' : `${h.opensAt} - ${h.closesAt}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sticky top-28">
              <div className="text-center mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${mechanic.isOpen ? 'bg-[#E6F4EA] text-[#1E7E34]' : 'bg-error-container/30 text-error'}`}>
                  <span className={`w-2 h-2 rounded-full ${mechanic.isOpen ? 'bg-[#1E7E34]' : 'bg-error'}`} />
                  {mechanic.isOpen ? 'Open Now' : 'Currently Closed'}
                </div>
              </div>

              {mechanic.whatsapp && (
                <a href={`https://wa.me/${mechanic.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                   className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all mb-3">
                  <Icon name="chat" /> WhatsApp
                </a>
              )}
              <a href={`tel:${mechanic.phone}`} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all mb-3">
                <Icon name="call" /> Call Now
              </a>
              <button onClick={handleDirections} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition-all shadow-md">
                <Icon name="directions" /> Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
