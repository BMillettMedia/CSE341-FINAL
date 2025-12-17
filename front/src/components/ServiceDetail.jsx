import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getService } from '../api';
import BookingForm from './BookingForm';

export default function ServiceDetail({ user }) {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const s = await getService(id);
        setService(s);
      } catch (e) {
        setErr(e.message || 'Failed to load service');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="container"><div className="card">Loading…</div></div>;
  if (err) return <div className="container"><div className="card">Error: {err}</div></div>;
  if (!service) return <div className="container"><div className="card">Service not found</div></div>;

  return (
    <div className="container">
      <div className="card">
        <h2>{service.category}</h2>
        <p><strong>Description:</strong> {service.description}</p>
        <p><strong>Price:</strong> {service.pricing ? `$${service.pricing}` : 'Contact'}</p>
        <p><strong>Provider:</strong> {service.providerName || service.providerId}</p>
        <p><strong>Location:</strong> {service.location?.city || '—'}</p>

        <hr />
        <h3>Book this service</h3>
        <BookingForm service={service} user={user} />
      </div>
    </div>
  );
}
