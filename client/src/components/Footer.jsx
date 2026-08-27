import { Link } from 'react-router-dom';
import Icon from './Icon';

const footerLinks = {
  product: [
    { label: 'Find a Mechanic', to: '/find' },
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'Pricing', to: '/#pricing' },
    { label: 'Join as Mechanic', to: '/auth/register' },
  ],
  support: [
    { label: 'Help Center', to: '/help' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'My Usage', to: '/usage' },
    { label: 'Top Up', to: '/payments' },
  ],
  company: [
    { label: 'About MecaFind', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Blog', to: '/blog' },
    { label: 'Press Kit', to: '/press' },
  ],
  legal: [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Cookie Policy', to: '/cookies' },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B1F3A] text-white">
      {/* Main Footer */}
      <div className="max-w-[1280px] mx-auto px-5 lg:px-16 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <img src="/mecafind-logo.png" alt="MecaFind Logo" className="h-10 w-10 rounded-xl object-cover" />
              <span className="font-semibold text-xl tracking-tight">MecaFind</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs mb-6">
              Yaoundé's trusted mechanic discovery platform. Find verified professionals, compare services, and get instant directions.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Facebook">
                <Icon name="language" size="text-[18px]" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Twitter">
                <Icon name="tag" size="text-[18px]" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Instagram">
                <Icon name="photo_camera" size="text-[18px]" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors" aria-label="LinkedIn">
                <Icon name="work" size="text-[18px]" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Product</h4>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/70 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/70 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/70 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>


      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/mecafind-logo.png" alt="MecaFind Logo" className="h-6 w-auto opacity-40" />
            <span className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} MecaFind Yaound&eacute;. All rights reserved.
            </span>
          </div>
          <div className="flex gap-5">
            {footerLinks.legal.map((link) => (
              <Link key={link.label} to={link.to} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
