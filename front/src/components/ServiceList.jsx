import React, { useEffect, useState } from 'react';
import { getServices } from '../api';
import ServiceCard from './ServiceCard';

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getServices();
        setServices(data || []);
      } catch (e) {
        setErr(e.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="container"><div className="card">Loading services…</div></div>;
  if (err) return <div className="container"><div className="card">Error: {err}</div></div>;

  return (
    <div className="container">
      <div style={{ marginTop: 16 }}>
        <h2>Available Services</h2>
        <div className="grid">
          {services.map(s => <ServiceCard key={s._id || s.serviceId} service={s} />)}
        </div>
      </div>
    </div>
  );
}
