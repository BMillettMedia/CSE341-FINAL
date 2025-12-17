import React from 'react';
import { Link } from 'react-router-dom';
import { checkAuth, startGoogleAuth, logout } from '../api';

export default function Header({ user, setUser }) {
  async function handleCheck() {
    try {
      const data = await checkAuth();
      setUser(data.user || null);
    } catch (e) {
      setUser(null);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <header className="header container">
      <div className="brand">Services Marketplace</div>
      <nav className="row">
        <Link to="/">Home</Link>
        <Link to="/my-bookings">My Bookings</Link>
        {user ? (
          <>
            <div style={{ marginLeft: 12 }}>{user.displayName || user.name || user.email}</div>
            <button className="link-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="button" onClick={() => startGoogleAuth()}>Login (Google)</button>
            <button className="link-button" onClick={handleCheck}>Check Auth</button>
          </>
        )}
      </nav>
    </header>
  );
}
