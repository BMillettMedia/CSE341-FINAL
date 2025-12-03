import React from 'react';
import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  const img = service.coverArt || `https://picsum.photos/seed/${service._id || service.serviceId}/600/400`;
  return (
    <div className="card">
      <img src={img} alt={service.category || 'service'} />
      <h3>{service.category} — {service.description?.slice(0, 40)}</h3>
      <p>Price: {service.pricing ? `$${service.pricing}` : 'Contact'}</p>
      <div style={{ marginTop: 8 }}>
        <Link to={`/services/${service._id || service.serviceId}`} className="link-button">View</Link>
      </div>
    </div>
  );
}
