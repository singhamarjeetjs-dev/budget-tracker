// src/components/AuthLayout.tsx
import React from 'react';

/**
 * Simple wrapper for auth pages (login/signup) that provides
 * a minimal centered container and hides app chrome.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center app-auth-bg px-4 py-12">
      <div className="auth-card">
        {children}
      </div>
    </div>
  );
}
