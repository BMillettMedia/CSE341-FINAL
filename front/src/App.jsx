import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ServicePage from './pages/ServicePage';
import MyBookings from './pages/MyBookings';
import Login from './components/Login';
import NotFound from './components/NotFound';
import { checkAuth } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function load() {
      try {
        const data = await checkAuth();
        setUser(data.user || null);
      } catch (e) {
        setUser(null);
      }
    }
    load();
  }, []);

  return (
    <div>
      <Header user={user} setUser={setUser} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services/:id" element={<ServicePage user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-bookings" element={<MyBookings user={user} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer container">Built for CSE341 — simple demo UI</footer>
    </div>
  );
}
