import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyEmail } from '../api/auth';

export default function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    verifyEmail(token)
      .then(() => {
        setMessage("Email verified! You can now login.");
      })
      .catch(() => setMessage("Verification failed."));
  }, [token]);

 return (
  <div style={{
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to bottom, #0f172a, #1e293b)",
    color: "white",
    textAlign: "center"
  }}>
    <div style={{
      padding: "30px",
      borderRadius: "20px",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 0 30px rgba(0,200,255,0.3)"
    }}>
      <h1 style={{ marginBottom: "10px" }}>
        {message.includes("verified") ? "✅ Verified!" : "❌ Error"}
      </h1>

      <p style={{ marginBottom: "20px" }}>{message}</p>

      {message.includes("verified") && (
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#38bdf8",
            color: "black",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Go to Login
        </button>
      )}
    </div>
  </div>
);}
