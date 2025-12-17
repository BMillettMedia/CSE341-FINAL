import React from 'react';
import { startGoogleAuth } from '../api';

export default function Login() {
  return (
    <div className="container">
      <div className="card">
        <h3>Login</h3>
        <p>Use Google OAuth to sign in.</p>
        <button className="button" onClick={() => startGoogleAuth()}>Sign in with Google</button>
      </div>
    </div>
  );
}
