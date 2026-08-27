import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../../components/Icon';

const types = [
  {
    key: 'car_owner',
    icon: 'directions_car',
    title: "I'm a Car Owner",
    desc: 'Find trusted mechanics and get directions in seconds.',
    color: 'primary',
    iconBg: 'bg-primary-fixed-dim text-primary',
    ring: 'ring-primary',
    bg: 'bg-primary-fixed/10',
    features: [
      { icon: 'search', text: 'Discover verified workshops' },
      { icon: 'route', text: 'Get instant GPS directions' },
      { icon: 'star', text: 'Read reviews & compare ratings' },
    ],
  },
  {
    key: 'mechanic',
    icon: 'build',
    title: "I'm a Mechanic",
    desc: 'List your workshop and reach more customers in Yaoundé.',
    color: 'tertiary',
    iconBg: 'bg-tertiary-fixed-dim text-tertiary',
    ring: 'ring-tertiary',
    bg: 'bg-tertiary-fixed/10',
    features: [
      { icon: 'storefront', text: 'Create your workshop profile' },
      { icon: 'payments', text: 'Manage bookings & payments' },
      { icon: 'analytics', text: 'Track performance & reviews' },
    ],
  },
];

export default function SelectType() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  return (
    <main className="pt-20 min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="w-full max-w-5xl mx-auto px-5 lg:px-16 py-12 relative z-10">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-10">
          <Icon name="arrow_back" size="text-[18px]" /> Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
            <Icon name="how_to_reg" size="text-[16px]" /> Step 1 of 2
          </div>
          <h1 className="text-4xl lg:text-[48px] font-bold text-on-background mb-3 tracking-tight">Join MecaFind</h1>
          <p className="text-lg text-on-surface-variant max-w-lg mx-auto">Select your account type to get started.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {types.map((t) => {
            const isActive = selected === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setSelected(t.key)}
                className={`group relative text-left rounded-2xl p-8 flex flex-col h-full transition-all duration-300 ${
                  isActive
                    ? `ring-2 ${t.ring} ${t.bg} shadow-lg scale-[1.02]`
                    : 'bg-white ring-1 ring-outline-variant/30 shadow-sm hover:shadow-md hover:ring-outline-variant'
                }`}
              >
                {/* Check circle */}
                <div className={`absolute top-6 right-6 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  isActive ? `${t.ring.replace('ring-', 'bg-')} border-transparent` : 'border-outline-variant bg-white'
                }`}>
                  {isActive && <Icon name="check" size="text-[18px]" className="text-white" />}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 ${t.iconBg}`}>
                  <Icon name={t.icon} size="text-[32px]" />
                </div>

                {/* Text */}
                <h2 className="text-xl font-semibold text-on-surface mb-2">{t.title}</h2>
                <p className="text-base text-on-surface-variant mb-5">{t.desc}</p>

                {/* Features */}
                <div className="mt-auto pt-4 border-t border-outline-variant/20 space-y-2.5">
                  {t.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? `${t.ring.replace('ring-', 'bg-')}/15` : 'bg-surface-container-high'}`}>
                        <Icon name={f.icon} size="text-[14px]" className={isActive ? t.ring.replace('ring-', 'text-') : 'text-on-surface-variant'} />
                      </div>
                      <span className="text-sm text-on-surface-variant">{f.text}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <div className="flex justify-center">
          <button
            onClick={() => selected && navigate(`/auth/signup?role=${selected}`)}
            disabled={!selected}
            className="bg-primary text-on-primary font-semibold text-sm py-4 px-16 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:translate-y-0 uppercase tracking-wider flex items-center gap-2"
          >
            Continue
            <Icon name="arrow_forward" size="text-[20px]" />
          </button>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-on-surface-variant mt-6">
          Already have an account?{' '}
          <Link to="/auth/signin" className="font-semibold text-primary hover:text-primary-container transition-colors">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
