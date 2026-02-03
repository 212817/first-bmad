// apps/web/src/components/spot/AddressInput.tsx
import { useState } from 'react';
import type { AddressInputProps } from './types';

/** Placeholder example address */
const PLACEHOLDER = '123 Main St, City, State';

/** Minimum address length to allow submission */
const MIN_LENGTH = 5;

/**
 * Address input component for manual address entry
 * Used when location permission is denied
 */
export const AddressInput = ({
  onSubmit,
  isLoading = false,
  disabled = false,
}: AddressInputProps) => {
  const [address, setAddress] = useState('');

  const trimmedAddress = address.trim();
  const isValid = trimmedAddress.length >= MIN_LENGTH;

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading && !disabled) {
      onSubmit(trimmedAddress);
    }
  };

  /**
   * Handle clear button click
   */
  const handleClear = () => {
    setAddress('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" data-testid="address-input">
      <div>
        <label
          htmlFor="address-input-field"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Enter parking address
        </label>
        <div className="relative">
          <input
            id="address-input-field"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={PLACEHOLDER}
            disabled={isLoading || disabled}
            className={`
              w-full p-3 pr-10 border rounded-lg
              text-gray-900 placeholder-gray-400
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              ${isLoading || disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white'}
              border-gray-200
            `}
            data-testid="address-input-field"
          />
          {address && !isLoading && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear address"
              data-testid="address-input-clear"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={!isValid || isLoading || disabled}
        className="w-full h-12 bg-indigo-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-colors"
        data-testid="address-input-submit"
      >
        {isLoading ? 'Finding location...' : 'Save Spot'}
      </button>
    </form>
  );
};
