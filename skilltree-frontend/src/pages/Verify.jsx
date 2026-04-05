import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Verify() {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    axios.get(`http://lifexpskilltree.xyz/api/verify/${token}`)
      .then(() => setMessage("Email verified! You can now login."))
      .catch(() => setMessage("Verification failed."));
  }, [token]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>{message}</h2>
    </div>
  );
}
