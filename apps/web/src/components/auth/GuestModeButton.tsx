// apps/web/src/components/auth/GuestModeButton.tsx

interface GuestModeButtonProps {
  onClick: () => void;
  loading?: boolean;
}

/**
 * Guest mode button component
 * Secondary styled button for entering guest mode
 */
export const GuestModeButton = ({ onClick, loading = false }: GuestModeButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full h-12 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Loading...' : 'Continue as Guest'}
    </button>
  );
};
