import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyEmail } from '../api/auth';

export default function Verify() {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
  verifyEmail(token)
    .then(() => setMessage("Email verified! You can now login."))
    .catch(() => setMessage("Verification failed."));
}, [token]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>{message}</h2>
    </div>
  );
}
