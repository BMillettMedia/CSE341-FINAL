import React, { useEffect, useState } from 'react';
import { getBookings } from '../api';

export default function BookingList({ user }) {
  const [bookings, setBookings] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const userId = user ? (user._id || user.id || user.userId) : null;
        const data = await getBookings(userId);
        setBookings(data || []);
      } catch (e) {
        setErr(e.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  if (!user) return <div className="container"><div className="card">Log in to view your bookings.</div></div>;
  if (loading) return <div className="container"><div className="card">Loading bookings…</div></div>;
  if (err) return <div className="container"><div className="card">Error: {err}</div></div>;

  return (
    <div className="container">
      <h2>My Bookings</h2>
      <div className="grid">
        {bookings.map(b => (
          <div key={b._id || b.bookingId} className="card">
            <p><strong>Service:</strong> {b.serviceId?.toString?.() || b.serviceId}</p>
            <p><strong>Date:</strong> {b.scheduledFor || b.date}</p>
            <p><strong>Status:</strong> {b.status}</p>
            <p><strong>Price:</strong> {b.price || b.totalCost}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
