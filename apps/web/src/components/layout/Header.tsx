// apps/web/src/components/layout/Header.tsx
import { Link } from 'react-router-dom';
import { ProfileMenu } from './ProfileMenu';

/**
 * Header component with app title, history link, and profile menu
 */
export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-indigo-900">Where Did I Park?</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/history"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              aria-label="View spot history"
              data-testid="history-link"
            >
              <span aria-hidden="true">🕒</span>
              <span className="hidden sm:inline">History</span>
            </Link>
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
