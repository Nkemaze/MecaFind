import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function NotFound() {
  return (
    <main className="pt-20 min-h-screen bg-background flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-6">
          <Icon name="explore_off" size="text-[48px]" className="text-on-surface-variant" />
        </div>
        <h1 className="text-4xl font-bold text-on-surface mb-3 tracking-tight">404</h1>
        <h2 className="text-xl font-semibold text-on-surface mb-2">Page Not Found</h2>
        <p className="text-base text-on-surface-variant mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary-container transition-all shadow-md"
        >
          <Icon name="home" size="text-[20px]" />
          Go Home
        </Link>
      </div>
    </main>
  );
}
