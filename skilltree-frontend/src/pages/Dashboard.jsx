import { useAuth } from '../context/AuthContext';
import './dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboardBg">
      <div className="dashboardFrame">

        <div className="characterPanel">
          <h2>{user?.email || "Adventurer"}</h2>
          <p>Level 1</p>

          <div className="xpBar">
            <div className="xpFill"></div>
          </div>
        </div>

        <div className="statsPanel">

          <div className="card">
            <h3>🧠 Intelligence</h3>
            <button>Add Study</button>
          </div>

          <div className="card">
            <h3>💪 Strength</h3>
            <button>Add Activity</button>
          </div>

          <div className="card">
            <h3>🍎 Health</h3>
            <button>Add Meal</button>
          </div>

          <div className="card">
            <h3>💕 Relationships</h3>
            <button>Add Plan</button>
          </div>

        </div>

      </div>
    </div>
  );
}
