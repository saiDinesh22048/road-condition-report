import React from 'react';
import { Outlet } from 'react-router-dom';
import { UserNavbar } from './UserNavbar';

export const UserLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
