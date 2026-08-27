import { useEffect, useRef } from 'react';
import Icon from './Icon';

const variants = {
  success: { icon: 'check_circle', color: 'bg-[#1E7E34]', bg: 'bg-[#E6F4EA]', ring: 'ring-[#1E7E34]/20' },
  error: { icon: 'error', color: 'bg-error', bg: 'bg-error-container/30', ring: 'ring-error/20' },
  info: { icon: 'info', color: 'bg-primary', bg: 'bg-primary/10', ring: 'ring-primary/20' },
  warning: { icon: 'warning', color: 'bg-[#E65100]', bg: 'bg-[#FFF3E0]', ring: 'ring-[#E65100]/20' },
};

export default function Modal({ open, onClose, title, message, variant = 'info', buttonText = 'OK' }) {
  const overlayRef = useRef(null);
  const v = variants[variant] || variants.info;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl ${v.bg} flex items-center justify-center mx-auto mb-4`}>
            <Icon name={v.icon} size="text-[28px]" className={variant === 'success' ? 'text-[#1E7E34]' : variant === 'error' ? 'text-error' : variant === 'warning' ? 'text-[#E65100]' : 'text-primary'} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-on-surface mb-2">{title}</h3>

          {/* Message */}
          {message.includes('\n') ? (
            <div className="text-sm text-on-surface-variant leading-relaxed text-left bg-error-container/20 rounded-xl p-3 mt-2 max-h-48 overflow-y-auto">
              {message.split('\n').map((line, i) => (
                <p key={i} className="py-0.5">{line}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>
          )}
        </div>

        {/* Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md ${
              variant === 'success' ? 'bg-[#1E7E34] hover:bg-[#1B7231]' :
              variant === 'error' ? 'bg-error hover:bg-error/90' :
              variant === 'warning' ? 'bg-[#E65100] hover:bg-[#D35400]' :
              'bg-primary hover:bg-primary-container'
            }`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
