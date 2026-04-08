import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './dashboard.css';
import bg from '../assets/auth/dashboard.png';

export default function Dashboard() {
  const { user } = useAuth();

  const [studyHours, setStudyHours] = useState(0);
  const [activityMinutes, setActivityMinutes] = useState(0);
  const [meal, setMeal] = useState('');
  const [showCalories, setShowCalories] = useState(false);
  const [calories, setCalories] = useState('');
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState('');

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const maxXp = 100;
  const xpPercent = (xp / maxXp) * 100;

  const gainXp = (amount) => {
    let newXp = xp + amount;

    if (newXp >= maxXp) {
      setLevel(level + 1);
      newXp = newXp - maxXp;
    }

    setXp(newXp);
  };

  return (
    <div
      className="dashboardBg"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="dashboardFrame">

        {/* CHARACTER PANEL */}
        <div className="characterPanel">
          <h2>{user?.email || "Adventurer"}</h2>
          <p>Level {level}</p>

          <div className="xpBar">
            <div
              className="xpFill"
              style={{ width: `${xpPercent}%` }}
            ></div>
          </div>
        </div>

        {/* STATS */}
        <div className="statsPanel">

          {/* INTELLIGENCE */}
          <div className="card">
            <h3>🧠 Intelligence</h3>
            <p>{studyHours} hrs</p>

            <button onClick={() => {
              setStudyHours(studyHours + 1);
              gainXp(10);
            }}>
              +1 Hour
            </button>
          </div>

          {/* STRENGTH */}
          <div className="card">
            <h3>💪 Strength</h3>
            <p>{activityMinutes} mins</p>

            <button onClick={() => {
              setActivityMinutes(activityMinutes + 10);
              gainXp(8);
            }}>
              +10 min
            </button>
          </div>

          {/* HEALTH */}
          <div className="card">
            <h3>🍎 Health</h3>

            <input
              type="text"
              placeholder="What did you eat?"
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
            />

            <label>
              <input
                type="checkbox"
                checked={showCalories}
                onChange={() => setShowCalories(!showCalories)}
              />
              Add calories?
            </label>

            {showCalories && (
              <input
                type="number"
                placeholder="Calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            )}

            <button onClick={() => gainXp(5)}>
              Log Meal
            </button>
          </div>

          {/* RELATIONSHIPS */}
          <div className="card">
            <h3>💕 Relationships</h3>

            <input
              type="text"
              placeholder="Add plan"
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
            />

            <button onClick={() => {
              if (newPlan.trim() === '') return;
              setPlans([...plans, newPlan]);
              setNewPlan('');
              gainXp(12);
            }}>
              Add
            </button>

            <ul>
              {plans.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
