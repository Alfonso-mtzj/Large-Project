import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>🎉 You're Logged In!</h1>
      {user ? (
        <>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
}
