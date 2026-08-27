import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import LocationPickerModal from '../../components/LocationPickerModal';

const tabs = [
  { key: 'overview', label: 'Overview', icon: 'dashboard' },
  { key: 'basic', label: 'Basic Info', icon: 'storefront' },
  { key: 'services', label: 'Services & Brands', icon: 'build' },
  { key: 'hours', label: 'Opening Hours', icon: 'schedule' },
  { key: 'photos', label: 'Photos & Location', icon: 'photo_camera' },
];

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRESET_SERVICES = [
  'Engine Repair', 'Engine Diagnostics', 'Engine Overhaul', 'Engine Tuning',
  'Oil Change', 'Brake Repair', 'Brake Pad Replacement', 'Brake Disc Resurfacing',
  'Clutch Repair', 'Clutch Replacement', 'Clutch Adjustment',
  'Transmission Repair', 'Transmission Service', 'Automatic Transmission', 'Manual Transmission',
  'Electrical Diagnostics', 'Battery Replacement', 'Alternator Repair', 'Starter Motor Repair',
  'Wiring Repair', 'ECU Programming',
  'AC Repair', 'AC Gas Refill', 'AC Compressor Repair', 'Heating System Repair',
  'Suspension Repair', 'Shock Absorber Replacement', 'Spring Replacement', 'Wheel Alignment',
  'Wheel Balancing', 'Tyre Replacement', 'Tyre Puncture Repair', 'Tyre Rotation',
  'Rimming', 'Tyre Pressure Monitoring',
  'Fuel System Repair', 'Fuel Injector Cleaning', 'Fuel Pump Replacement',
  'Cooling System Repair', 'Radiator Repair', 'Water Pump Replacement', 'Thermostat Replacement',
  'Exhaust System Repair', 'Muffler Replacement', 'Catalytic Converter',
  'Steering Repair', 'Power Steering Repair', 'Steering Rack Replacement',
  'Body Work', 'Panel Beating', 'Painting', 'Denting', 'Rust Repair',
  'Windshield Replacement', 'Window Repair', 'Mirror Replacement',
  'Car Washing', 'Detailing', 'Polishing', 'Interior Cleaning',
  'Pre-Purchase Inspection', 'General Maintenance', 'Periodic Service',
  'Spark Plug Replacement', 'Air Filter Replacement', 'Fuel Filter Replacement',
  'Timing Belt Replacement', 'Drive Belt Replacement',
  'Differential Repair', 'Axle Repair', 'CV Joint Replacement',
  'LPG/CNG Conversion', 'LPG System Service',
  'Jump Start', 'Roadside Assistance', 'Towing Service',
  'Car Scanning', 'Fault Code Reading', 'Software Update',
  'Battery Charging', 'Battery Testing',
  'Headlight Restoration', 'Light Installation', 'LED Installation',
  'Seat Repair', 'Upholstery', 'Carpet Cleaning',
  'Immobilizer Repair', 'Key Programming', 'Remote Key Replacement',
];

const PRESET_BRANDS = [
  'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Mitsubishi',
  'Suzuki', 'Subaru', 'Isuzu', 'Daihatsu', 'Lexus', 'Infiniti',
  'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Porsche', 'Opel',
  'Ford', 'Chevrolet', 'Jeep', 'Dodge', 'Chrysler', 'Ram',
  'Peugeot', 'Renault', 'Citroen', 'Fiat', 'Alfa Romeo',
  'Volvo', 'Saab', 'Land Rover', 'Jaguar', 'Mini',
  'Tesla', 'Rivian', 'Lucid',
  'BYD', 'Changan', 'Chery', 'Geely', 'Great Wall', 'Haval',
  'MG', 'Tata', 'Mahindra',
  'Scania', 'MAN', 'Iveco', 'DAF', 'Mercedes Trucks',
  'Sinotruk', 'Howo', 'Foton', 'JAC',
  'Yamaha', 'Suzuki Motor', 'Kawasaki',
  'Other',
];

function MapClickHandler({ onPositionSelect }) {
  useMapEvents({ click(e) { onPositionSelect(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function PhotoUpload({ photos, onUploaded, onDeleted, profileExists, showModal }) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files) {
    const selected = Array.from(files).filter((f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type));
    if (!selected.length) return showModal('Invalid Files', 'Choose JPEG, PNG, or WebP images.', 'warning');
    const available = 8 - photos.length;
    if (selected.length > available) return showModal('Too Many Photos', `You can upload ${available} more photo${available === 1 ? '' : 's'}.`, 'warning');
    const data = new FormData();
    selected.forEach((f) => data.append('photos', f));
    setUploading(true);
    try {
      const res = await api.post('/mechanics/me/photos', data);
      onUploaded(res.data.photos || []);
    } catch (e) { showModal('Upload Failed', e.response?.data?.message || 'Could not upload the photos.', 'error'); }
    finally { setUploading(false); }
  }

  async function removePhoto(id) {
    try { await api.delete(`/mechanics/me/photos/${id}`); onDeleted(id); }
    catch (e) { showModal('Delete Failed', e.response?.data?.message || 'Could not remove the photo.', 'error'); }
  }

  return (
    <div>
      <div
        onDrop={(e) => { e.preventDefault(); if (profileExists) handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all mb-5 ${
          profileExists
            ? 'border-outline-variant/40 hover:border-primary/40 hover:bg-primary/[0.02] cursor-pointer'
            : 'border-outline-variant/20 opacity-50 cursor-not-allowed'
        }`}
        onClick={() => profileExists && document.getElementById('photo-upload-input')?.click()}
      >
        <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-4">
          <Icon name="cloud_upload" size="text-[28px]" className="text-on-surface-variant" />
        </div>
        <p className="text-sm font-semibold text-on-surface">
          {uploading ? 'Uploading...' : 'Click or drag photos here'}
        </p>
        <p className="text-xs text-on-surface-variant mt-1.5">JPEG, PNG, WebP — max 8 photos</p>
        <input id="photo-upload-input" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
          disabled={!profileExists || uploading} onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
      </div>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative group aspect-square rounded-xl overflow-hidden ring-1 ring-outline-variant/20">
              <img src={p.imageUrl} alt="Workshop" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button onClick={() => removePhoto(p.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                <Icon name="close" size="text-[14px]" />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-on-surface-variant mt-3">
        {!profileExists ? 'Save your profile first.' : `${photos.length}/8 photos uploaded.`}
      </p>
    </div>
  );
}

function PresetPicker({ label, icon, iconColor, presets, selected, onAdd, onRemove, customValue, setCustomValue, count }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? presets : presets.slice(0, 20);

  function handleAdd(val) {
    onAdd(val);
  }

  return (
    <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: iconColor }}>
          <Icon name={icon} size="text-[18px]" className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-on-surface">{label}</h2>
          <p className="text-xs text-on-surface-variant">{count} selected</p>
        </div>
      </div>

      {/* Custom input */}
      <div className="flex gap-2 mb-4">
        <input value={customValue} onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), customValue.trim() && !selected.includes(customValue.trim()) && (onAdd(customValue.trim()), setCustomValue('')))}
          placeholder="Type your own..."
          className="flex-1 h-11 px-4 bg-surface-container-low rounded-xl text-sm ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40 transition-all" />
        <button onClick={() => { if (customValue.trim() && !selected.includes(customValue.trim())) { onAdd(customValue.trim()); setCustomValue(''); } }}
          className="px-5 h-11 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-all shrink-0">Add</button>
      </div>

      {/* Selected */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((s) => (
            <span key={s} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium">
              {s}
              <button onClick={() => onRemove(s)} className="hover:text-error transition-colors ml-0.5"><Icon name="close" size="text-[14px]" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Preset grid */}
      <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Quick Select</p>
      <div className="flex flex-wrap gap-1.5">
        {displayed.map((p) => {
          const isSelected = selected.includes(p);
          return (
            <button key={p} onClick={() => isSelected ? onRemove(p) : handleAdd(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-primary/10 hover:text-primary'
              }`}>
              {p}
            </button>
          );
        })}
      </div>
      {presets.length > 20 && (
        <button onClick={() => setShowAll(!showAll)} className="text-xs font-semibold text-primary mt-3 hover:underline">
          {showAll ? 'Show less' : `Show all ${presets.length} options`}
        </button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    workshopName: '', description: '', address: '', city: 'Yaoundé',
    phone: '', whatsapp: '', isMobileService: false,
    latitude: '', longitude: '',
    services: [], carBrands: [],
    hours: days.map((_, i) => ({ dayOfWeek: i, opensAt: '08:00', closesAt: '18:00', isClosed: i === 0 })),
  });
  const [newService, setNewService] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [modal, setModal] = useState({ open: false, title: '', message: '', variant: 'info' });
  const showModal = (title, message, variant = 'info') => setModal({ open: true, title, message, variant });
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  useEffect(() => {
    api.get('/mechanics/me')
      .then(({ data }) => {
        const m = data.mechanic;
        setProfile(m);
        setForm({
          workshopName: m.workshopName || '', description: m.description || '',
          address: m.address || '', city: m.city || 'Yaoundé',
          phone: m.phone || '', whatsapp: m.whatsapp || '',
          isMobileService: m.isMobileService || false,
          latitude: String(m.latitude || ''), longitude: String(m.longitude || ''),
          services: (m.services || []).map((s) => s.serviceName),
          carBrands: (m.carBrands || []).map((b) => b.brandName),
          hours: m.hours?.length
            ? days.map((_, i) => {
                const found = m.hours.find((h) => h.dayOfWeek === i);
                if (found) return { dayOfWeek: i, opensAt: found.opensAt || '08:00', closesAt: found.closesAt || '18:00', isClosed: found.isClosed };
                return { dayOfWeek: i, opensAt: '08:00', closesAt: '18:00', isClosed: i === 0 };
              })
            : days.map((_, i) => ({ dayOfWeek: i, opensAt: '08:00', closesAt: '18:00', isClosed: i === 0 })),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function padTime(t) {
    if (!t || typeof t !== 'string') return '08:00';
    const [h, m] = t.split(':');
    return `${(h || '0').padStart(2, '0')}:${(m || '0').padStart(2, '0')}`;
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const cleanedHours = form.hours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        opensAt: h.isClosed ? null : padTime(h.opensAt),
        closesAt: h.isClosed ? null : padTime(h.closesAt),
        isClosed: h.isClosed,
      }));
      const payload = {
        workshopName: form.workshopName, description: form.description || null,
        address: form.address, city: form.city,
        latitude: parseFloat(form.latitude) || 3.848, longitude: parseFloat(form.longitude) || 11.498,
        phone: form.phone, whatsapp: form.whatsapp || null,
        isMobileService: form.isMobileService,
        services: form.services, carBrands: form.carBrands, hours: cleanedHours,
      };
      if (profile) {
        const { data } = await api.patch('/mechanics/me', payload);
        setProfile(data.mechanic);
      } else {
        const { data } = await api.post('/mechanics', payload);
        setProfile(data.mechanic);
      }
      showModal('Profile Saved', 'Your workshop profile has been updated successfully.', 'success');
    } catch (e) {
      const details = e.response?.data?.errors?.fieldErrors;
      const msg = details
        ? Object.entries(details).map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n')
        : e.response?.data?.message || 'Failed to save profile.';
      showModal('Save Failed', msg, 'error');
    }
    finally { setSaving(false); }
  }

  function addService(s) { if (s && !form.services.includes(s)) setForm({ ...form, services: [...form.services, s] }); }
  function removeService(s) { setForm({ ...form, services: form.services.filter((x) => x !== s) }); }
  function addBrand(b) { if (b && !form.carBrands.includes(b)) setForm({ ...form, carBrands: [...form.carBrands, b] }); }
  function removeBrand(b) { setForm({ ...form, carBrands: form.carBrands.filter((x) => x !== b) }); }
  function updateHour(i, field, value) {
    const h = [...form.hours];
    h[i] = { ...h[i], [field]: value };
    if (field === 'isClosed' && value === false && !h[i].opensAt) {
      h[i].opensAt = '08:00';
      h[i].closesAt = '18:00';
    }
    setForm({ ...form, hours: h });
  }

  const openDays = form.hours.filter((h) => !h.isClosed).length;
  const completionPct = profile
    ? Math.round(
        (1 +
          (form.workshopName ? 1 : 0) + (form.description ? 1 : 0) +
          (form.address ? 1 : 0) + (form.phone ? 1 : 0) +
          (form.services.length ? 1 : 0) + (form.carBrands.length ? 1 : 0) +
          ((profile.photos?.length || 0) > 0 ? 1 : 0) +
          (form.latitude && form.longitude ? 1 : 0)
        ) / 9 * 100
      )
    : 0;

  if (loading) {
    return (
      <main className="pt-[72px] min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Icon name="progress_activity" size="text-[40px]" className="animate-spin text-primary" />
          <p className="text-sm text-on-surface-variant">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-[72px] min-h-screen bg-surface">
      {/* Mobile tab bar */}
      <div className="lg:hidden sticky top-[72px] z-40 bg-white/95 backdrop-blur-xl border-b border-outline-variant/40">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
              }`}>
              <Icon name={t.icon} size="text-[16px]" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-72px)]">
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-[72px] h-[calc(100vh-72px)] border-r border-outline-variant/30 bg-white p-6 flex flex-col">
            <div className="mb-6 pb-6 border-b border-outline-variant/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{user?.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Profile Complete</span>
                  <span className="text-xs font-bold text-primary">{completionPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-container-low overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${completionPct}%` }} />
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tab === t.key
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}>
                  <Icon name={t.icon} size="text-[20px]" /> {t.label}
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-outline-variant/20 mt-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                profile?.approvalStatus === 'approved'
                  ? 'bg-[#E6F4EA] text-[#1E7E34]'
                  : profile?.approvalStatus === 'pending'
                    ? 'bg-[#FFF3E0] text-[#E65100]'
                    : 'bg-surface-container-low text-on-surface-variant'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  profile?.approvalStatus === 'approved' ? 'bg-[#1E7E34]' : profile?.approvalStatus === 'pending' ? 'bg-[#E65100]' : 'bg-on-surface-variant/30'
                }`} />
                {profile?.approvalStatus === 'approved' ? 'Workshop Approved' : profile?.approvalStatus === 'pending' ? 'Pending Review' : 'Not Yet Created'}
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 p-5 lg:p-10">

          {/* ─── Overview ─── */}
          {tab === 'overview' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-on-surface">Workshop Dashboard</h1>
                <p className="text-sm text-on-surface-variant mt-1">Manage your workshop profile and settings</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: 'verified', label: 'Profile Status', value: profile?.approvalStatus === 'approved' ? 'Approved' : profile?.approvalStatus === 'pending' ? 'Pending' : 'Not Created', iconBg: profile?.approvalStatus === 'approved' ? 'bg-[#1E7E34]' : 'bg-[#E65100]' },
                  { icon: 'build', label: 'Services', value: form.services.length, iconBg: 'bg-primary' },
                  { icon: 'schedule', label: 'Open Days', value: `${openDays}/7`, iconBg: 'bg-tertiary' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 ring-1 ring-outline-variant/20 hover:ring-outline-variant/40 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                        <Icon name={s.icon} size="text-[18px]" className="text-white" />
                      </div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{s.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-on-surface">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white rounded-2xl p-6 ring-1 ring-outline-variant/20">
                  <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'basic', icon: 'storefront', label: 'Edit Workshop Info', desc: 'Name, address, phone' },
                      { key: 'services', icon: 'build', label: 'Manage Services', desc: 'Add or remove services' },
                      { key: 'hours', icon: 'schedule', label: 'Set Opening Hours', desc: 'Weekday schedule' },
                      { key: 'photos', icon: 'photo_camera', label: 'Upload Photos', desc: 'Workshop gallery' },
                    ].map((a) => (
                      <button key={a.key} onClick={() => setTab(a.key)}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low hover:bg-primary/5 hover:ring-1 hover:ring-primary/20 text-left transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-white ring-1 ring-outline-variant/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <Icon name={a.icon} size="text-[18px]" className="text-on-surface-variant group-hover:text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{a.label}</p>
                          <p className="text-[11px] text-on-surface-variant">{a.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl p-6 ring-1 ring-outline-variant/20">
                  <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">Workshop Summary</h2>
                  <div className="space-y-3">
                    {[
                      { icon: 'storefront', label: form.workshopName || 'Not set', sub: 'Workshop Name' },
                      { icon: 'location_on', label: form.address || 'Not set', sub: 'Address' },
                      { icon: 'phone', label: form.phone || 'Not set', sub: 'Phone' },
                      { icon: 'directions_car', label: form.isMobileService ? 'Yes' : 'No', sub: 'Mobile Service' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Icon name={item.icon} size="text-[16px]" className="text-on-surface-variant mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-on-surface-variant">{item.sub}</p>
                          <p className="text-sm font-medium text-on-surface truncate">{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Basic Info ─── */}
          {tab === 'basic' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Workshop Basic Info</h1>
                <p className="text-sm text-on-surface-variant mt-1">Update your workshop details and contact information</p>
              </div>
              <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 p-6 lg:p-8 max-w-2xl">
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">Workshop Name *</label>
                    <input value={form.workshopName} onChange={(e) => setForm({ ...form, workshopName: e.target.value })}
                      placeholder="e.g. AutoCare Garage"
                      className="w-full h-12 px-4 bg-surface-container-low rounded-xl text-sm ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
                      placeholder="Tell car owners about your workshop..."
                      className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-sm ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none resize-none placeholder:text-on-surface-variant/40 transition-all" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">Address *</label>
                      <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Street address"
                        className="w-full h-12 px-4 bg-surface-container-low rounded-xl text-sm ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">City</label>
                      <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full h-12 px-4 bg-surface-container-low rounded-xl text-sm ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">Phone *</label>
                      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+237 xxx xxx xxx"
                        className="w-full h-12 px-4 bg-surface-container-low rounded-xl text-sm ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">WhatsApp</label>
                      <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                        placeholder="+237 xxx xxx xxx"
                        className="w-full h-12 px-4 bg-surface-container-low rounded-xl text-sm ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40 transition-all" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer hover:bg-primary/5 transition-colors">
                    <input type="checkbox" checked={form.isMobileService} onChange={(e) => setForm({ ...form, isMobileService: e.target.checked })}
                      className="w-5 h-5 rounded accent-primary" />
                    <div>
                      <span className="text-sm font-medium text-on-surface">Mobile / On-site service</span>
                      <p className="text-xs text-on-surface-variant">You travel to the customer's location</p>
                    </div>
                  </label>
                </div>
                <div className="mt-8 pt-6 border-t border-outline-variant/20">
                  <button onClick={saveProfile} disabled={saving}
                    className="px-8 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container hover:shadow-md transition-all disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Services & Brands ─── */}
          {tab === 'services' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Services &amp; Brands</h1>
                <p className="text-sm text-on-surface-variant mt-1">Select from the list below or type your own</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PresetPicker
                  label="Services Offered" icon="build" iconColor="#0047c1"
                  presets={PRESET_SERVICES} selected={form.services}
                  onAdd={addService} onRemove={removeService}
                  customValue={newService} setCustomValue={setNewService}
                  count={form.services.length}
                />
                <PresetPicker
                  label="Car Brands" icon="directions_car" iconColor="#8a3a00"
                  presets={PRESET_BRANDS} selected={form.carBrands}
                  onAdd={addBrand} onRemove={removeBrand}
                  customValue={newBrand} setCustomValue={setNewBrand}
                  count={form.carBrands.length}
                />
              </div>
              <div className="mt-6">
                <button onClick={saveProfile} disabled={saving}
                  className="px-8 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container hover:shadow-md transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* ─── Opening Hours ─── */}
          {tab === 'hours' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Opening Hours</h1>
                <p className="text-sm text-on-surface-variant mt-1">Set your weekly schedule</p>
              </div>
              <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 p-6 lg:p-8 max-w-2xl">
                <div className="space-y-2">
                  {form.hours.map((h, i) => (
                    <div key={i} className={`flex items-center gap-4 p-3.5 rounded-xl transition-all ${
                      h.isClosed ? 'bg-surface-container-low' : 'bg-surface-container-low ring-1 ring-primary/10'
                    }`}>
                      <div className="w-24 shrink-0">
                        <span className="text-sm font-semibold text-on-surface">{dayAbbr[i]}</span>
                        <p className="text-[10px] text-on-surface-variant">{days[i]}</p>
                      </div>
                      <div
                        className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 ${h.isClosed ? 'bg-outline-variant/40' : 'bg-primary'}`}
                        onClick={() => updateHour(i, 'isClosed', h.isClosed ? false : true)}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${h.isClosed ? 'translate-x-0' : 'translate-x-4'}`} />
                      </div>
                      {!h.isClosed ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input type="time" value={h.opensAt || '08:00'} onChange={(e) => updateHour(i, 'opensAt', e.target.value)}
                            className="h-9 px-2.5 bg-white rounded-lg ring-1 ring-outline-variant/30 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
                          <span className="text-xs text-on-surface-variant font-medium">to</span>
                          <input type="time" value={h.closesAt || '18:00'} onChange={(e) => updateHour(i, 'closesAt', e.target.value)}
                            className="h-9 px-2.5 bg-white rounded-lg ring-1 ring-outline-variant/30 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant italic flex-1">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-outline-variant/20">
                  <button onClick={saveProfile} disabled={saving}
                    className="px-8 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container hover:shadow-md transition-all disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Hours'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Photos & Location ─── */}
          {tab === 'photos' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Photos &amp; Location</h1>
                <p className="text-sm text-on-surface-variant mt-1">Upload workshop photos and pin your location on the map</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <Icon name="photo_camera" size="text-[18px]" className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-on-surface">Workshop Photos</h2>
                      <p className="text-xs text-on-surface-variant">{profile?.photos?.length || 0}/8 uploaded</p>
                    </div>
                  </div>
                  <PhotoUpload
                    photos={profile?.photos || []}
                    profileExists={Boolean(profile)}
                    onUploaded={(p) => setProfile((c) => ({ ...c, photos: [...(c.photos || []), ...p] }))}
                    onDeleted={(id) => setProfile((c) => ({ ...c, photos: c.photos.filter((x) => x.id !== id) }))}
                    showModal={showModal}
                  />
                </div>

                <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#1E7E34] flex items-center justify-center">
                      <Icon name="location_on" size="text-[18px]" className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-on-surface">Workshop Location</h2>
                      <p className="text-xs text-on-surface-variant">{form.latitude && form.longitude ? 'Location set' : 'No location set yet'}</p>
                    </div>
                  </div>

                  {form.latitude && form.longitude ? (
                    <div className="space-y-3">
                      <div className="rounded-xl overflow-hidden ring-1 ring-outline-variant/20 h-44 bg-surface-container-low flex items-center justify-center relative">
                        <img
                          src={`https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${form.longitude},${form.latitude}&zoom=14&marker=lonlat:${form.longitude},${form.latitude};color:%230047c1;size:medium&apiKey=`}
                          alt="Location preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                            <Icon name="location_on" size="text-[24px]" className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-surface-container-low rounded-lg px-3 py-2">
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Latitude</p>
                          <p className="text-xs font-semibold text-on-surface">{parseFloat(form.latitude).toFixed(6)}</p>
                        </div>
                        <div className="bg-surface-container-low rounded-lg px-3 py-2">
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Longitude</p>
                          <p className="text-xs font-semibold text-on-surface">{parseFloat(form.longitude).toFixed(6)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-outline-variant/30 h-44 flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center">
                        <Icon name="map" size="text-[24px]" className="text-on-surface-variant" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-on-surface">No location set</p>
                        <p className="text-xs text-on-surface-variant">Click the button below to pick your workshop location</p>
                      </div>
                    </div>
                  )}

                  <button onClick={() => setLocationPickerOpen(true)}
                    className="w-full mt-4 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container hover:shadow-md transition-all flex items-center justify-center gap-2">
                    <Icon name="map" size="text-[18px]" /> {form.latitude && form.longitude ? 'Change Location' : 'Select Location'}
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <button onClick={saveProfile} disabled={saving}
                  className="px-8 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container hover:shadow-md transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.title} message={modal.message} variant={modal.variant} />
      <LocationPickerModal
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        initialLat={form.latitude}
        initialLng={form.longitude}
        onConfirm={(lat, lng, addr) => {
          setForm({ ...form, latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
          setLocationPickerOpen(false);
        }}
      />
    </main>
  );
}
