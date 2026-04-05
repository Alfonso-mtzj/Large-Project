import { useAuth } from '../context/AuthContext';
export default function Dashboard()
{
  const { user } = useAuth();

  return (
    <div style= {{ textAlign: 'center, marginTop: '50px' }}>
      <h1>Dashboard</h1>
      <p>Welcome {user?.email || "User"}</p>
    </div>
  );
}
