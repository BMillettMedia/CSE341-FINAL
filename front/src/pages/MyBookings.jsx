import React from 'react';
import BookingList from '../components/BookingList';

export default function MyBookings({ user }) {
  return <BookingList user={user} />;
}
