"use client";

import { useSession } from "../context/session";

export const UserMenu: React.FC = () => {
  const { user, isAuthenticated, logout, isLoading } = useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <span>Welcome, {user.username}</span>
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};
