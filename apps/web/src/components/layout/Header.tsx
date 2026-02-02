// apps/web/src/components/layout/Header.tsx
import { ProfileMenu } from './ProfileMenu';

/**
 * Header component with app title and profile menu
 */
export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-indigo-900">Where Did I Park?</h1>
          </div>

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};
