export default function Icon({ name, className = '', size = 'text-[20px]' }) {
  return <span className={`material-symbols-outlined ${size} ${className}`}>{name}</span>;
}
