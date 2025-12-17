import React, { useState } from 'react';
import { createBooking } from '../api';

export default function BookingForm({ service, user }) {
  const [scheduledFor, setScheduledFor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setMessage('You must be logged in to book.');
      return;
    }
    if (!scheduledFor) {
      setMessage('Choose a date/time.');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        serviceId: service._id || service.serviceId,
        customerId: user._id || user.id || user.userId,
        providerId: service.providerId || service.provider?._id,
        scheduledFor,
        status: 'PENDING',
        price: service.pricing || 0,
        paymentMethod
      };
      const res = await createBooking(payload);
      setMessage(`Booking created (id: ${res.insertedId || res.bookingId || 'n/a'})`);
    } catch (err) {
      setMessage(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        <small>Scheduled for (ISO datetime):</small>
        <input className="input" value={scheduledFor} onChange={e=>setScheduledFor(e.target.value)} placeholder="2025-11-25T18:00:00Z" />
      </label>
      <label>
        <small>Payment method</small>
        <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="input">
          <option value="CASH">Cash</option>
          <option value="ORANGE">Orange Money</option>
          <option value="MTN">MTN</option>
          <option value="MOOV">Moov</option>
        </select>
      </label>
      <div className="row">
        <button className="button" disabled={loading}>{loading ? 'Booking…' : 'Book'}</button>
      </div>
      {message && <small>{message}</small>}
    </form>
  );
}
