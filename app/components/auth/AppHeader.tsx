'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

// Standalone auth controls component to be used in page headers
export function AuthControls() {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      {isLoading ? (
        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <div className="animate-pulse w-16 h-5 bg-white/10 rounded"></div>
        </div>
      ) : user ? (
        <UserMenu />
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white text-sm font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="hidden sm:inline">Ingresar</span>
        </button>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

// Legacy fixed header (to be removed from layout.tsx eventually)
function AppHeader() {
  return null; // No longer renders fixed header - use AuthControls in page headers instead
}

export default AppHeader;
