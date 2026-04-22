
import { useAuth } from '../context/AuthContext';
import './dashboard.css';
import bg from '../assets/auth/dashboard.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  console.log("USER IN DASHBOARD:", user);

  // ── INTELLIGENCE STATE ───────────────────────────────────────────
  const [studyHours, setStudyHours] = useState('');
  const [studyMinutes, setStudyMinutes] = useState('');
  const [studyMaterial, setStudyMaterial] = useState('');

  // ── STRENGTH STATE ───────────────────────────────────────────────
  const [activityMinutes, setActivityMinutes] = useState('');
  const [workout, setWorkout] = useState('');

  // ── HEALTH STATE ─────────────────────────────────────────────────
  const [meal, setMeal] = useState('');
  const [showCalories, setShowCalories] = useState(false);
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');
  const [vitamins, setVitamins] = useState(false);

  // ── RELATIONSHIPS / PLANNER STATE ────────────────────────────────
  const [newFriend, setNewFriend] = useState('');
  const [selectedFriend, setSelectedFriend] = useState('');
  const [activity, setActivity] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState('');

  const [friends, setFriends] = useState([]);
  const [plans, setPlans] = useState([]);
  const today = new Date().toISOString().split('T')[0];

  // ── XP / LEVEL STATE ─────────────────────────────────────────────
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  // ── LIVE CLOCK STATE ─────────────────────────────────────────────
  // Stores the current time so the clock re-renders every second
  const [now, setNow] = useState(new Date());

  const maxXp = 100;
  const xpPercent = (xp / maxXp) * 100;

  // ── GAIN XP HELPER ───────────────────────────────────────────────
  // Adds XP and levels up automatically when the bar fills
  const gainXp = (amount) => {
    let newXp = xp + amount;

    if (newXp >= maxXp) {
      setLevel(prev => prev + 1);
      newXp -= maxXp;
    }

    setXp(newXp);
  };

  // ── LOAD FRIENDS & PLANS FROM LOCALSTORAGE ON MOUNT ──────────────
  useEffect(() => {
    const savedFriends = localStorage.getItem('friends');
    const savedPlans = localStorage.getItem('plans');

    if (savedFriends) setFriends(JSON.parse(savedFriends));
    if (savedPlans) setPlans(JSON.parse(savedPlans));
  }, []);

  // ── SAVE FRIENDS TO LOCALSTORAGE WHENEVER THEY CHANGE ────────────
  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  // ── SAVE PLANS TO LOCALSTORAGE WHENEVER THEY CHANGE ──────────────
  useEffect(() => {
    localStorage.setItem('plans', JSON.stringify(plans));
  }, [plans]);

  // ── LOAD XP & LEVEL FROM LOCALSTORAGE ON MOUNT ───────────────────
  useEffect(() => {
    const savedXp = localStorage.getItem('xp');
    const savedLevel = localStorage.getItem('level');

    if (savedXp) setXp(Number(savedXp));
    if (savedLevel) setLevel(Number(savedLevel));
  }, []);

  // ── SAVE XP & LEVEL TO LOCALSTORAGE WHENEVER THEY CHANGE ─────────
  useEffect(() => {
    localStorage.setItem('xp', xp);
    localStorage.setItem('level', level);
  }, [xp, level]);

  // ── LIVE CLOCK — ticks every second ──────────────────────────────
  // setInterval updates `now` every 1000ms so the time stays current.
  // The cleanup function (clearInterval) stops the timer when the
  // component unmounts, preventing memory leaks.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── FIREFLY ANIMATION ─────────────────────────────────────────────
  // Creates floating firefly elements and appends them to the background.
  // Cleaned up automatically when the component unmounts.
  useEffect(() => {
    const container = document.querySelector('.dashboardBg') || document.querySelector('.calendarBg');
    if (!container) return;

    const flies = [];

    for (let i = 0; i < 25; i++) {
      const ff = document.createElement('div');
      ff.className = 'firefly';

      ff.style.left = Math.random() * 95 + '%';
      ff.style.top  = Math.random() * 90 + '%';

      ff.style.setProperty('--dx1', (Math.random()*120-60) + 'px');
      ff.style.setProperty('--dy1', (Math.random()*80-40)  + 'px');
      ff.style.setProperty('--dx2', (Math.random()*160-80) + 'px');
      ff.style.setProperty('--dy2', (Math.random()*120-60) + 'px');

      ff.style.animationDuration = `${Math.random()*6+4}s, ${Math.random()*2+1.5}s`;

      container.appendChild(ff);
      flies.push(ff);
    }

    return () => flies.forEach(f => f.remove());
  }, []);

  return (
    <>
      <div className="dashboardBg" style={{ backgroundImage: `url(${bg})` }}>
        <div className="dashboardFrame">

          {/* ── NAVIGATION BAR ── */}
          <div className="navBar">
            <button className="navButton" onClick={() => navigate('/dashboard')}>🧙 Home</button>
            <button className="navButton" onClick={() => navigate('/calendar')}>📅 Calendar</button>
            <button className="navButton" onClick={() => {
              logout();
              navigate('/login');
            }}>
              🚪 Logout
            </button>
          </div>

          {/* ── CHARACTER PANEL ── shows name, level, XP bar, and live clock */}
          <div className="characterPanel">
            <h2>
              {user === null
                ? "Loading..."
                : `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Adventurer"}
            </h2>

            <p>Level {level}</p>

            {/* XP progress bar */}
            <div className="xpBar">
              <div className="xpFill" style={{ width: `${xpPercent}%` }} />
            </div>

            {/* Live clock — uses `now` state which updates every second */}
            <p className="characterDate">
              {now.toLocaleDateString()} • {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* ── STATS PANEL ── contains all activity logging cards */}
          <div className="statsPanel">

            {/* ── INTELLIGENCE CARD ── logs study sessions */}
            <div className="card">
              <h3>🧠 Intelligence</h3>
              <input
                type="text"
                placeholder="Study Material"
                value={studyMaterial}
                onChange={(e) => setStudyMaterial(e.target.value)}
              />
              <input
                type="number"
                placeholder="Hours"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
              />
              <input
                type="number"
                placeholder="Minutes"
                value={studyMinutes}
                onChange={(e) => setStudyMinutes(e.target.value)}
              />
              <button onClick={() => {
                // Convert hours + minutes into a single decimal hour value
                const totalHours = Math.round((Number(studyHours) + (Number(studyMinutes) / 60)) * 10) / 10;
                if (!totalHours) return;

                gainXp(totalHours * 12);

                setPlans([
                  ...plans,
                  {
                    date: today,
                    studyMaterial,
                    studyHours: totalHours,
                    type: 'intelligence'
                  }
                ]);
                setStudyMaterial('');
                setStudyHours('');
                setStudyMinutes('');
              }}>
                Log Study
              </button>
            </div>

            {/* ── STRENGTH CARD ── logs workouts */}
            <div className="card">
              <h3>💪 Strength</h3>
              <input
                type="text"
                placeholder="What did you do?"
                value={workout}
                onChange={(e) => setWorkout(e.target.value)}
              />
              <input
                type="number"
                placeholder="Minutes exercised"
                value={activityMinutes}
                onChange={(e) => setActivityMinutes(e.target.value)}
              />
              <button onClick={() => {
                const mins = Number(activityMinutes);
                if (!mins) return;

                // 1 XP per 5 minutes of exercise
                gainXp(Math.round(mins / 5));

                setPlans([
                  ...plans,
                  {
                    date: today,
                    workout,
                    activityMinutes: mins,
                    type: 'strength'
                  }
                ]);

                setActivityMinutes('');
                setWorkout('');
              }}>
                Log Workout
              </button>
            </div>

            {/* ── HEALTH CARD ── logs meals, water, and vitamins */}
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

              {/* Conditionally show calorie input */}
              {showCalories && (
                <input
                  type="number"
                  placeholder="Calories"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              )}

              <input
                type="number"
                placeholder="Water (oz)"
                value={water}
                onChange={(e) => setWater(e.target.value)}
              />

              <label>
                <input
                  type="checkbox"
                  checked={vitamins}
                  onChange={() => setVitamins(!vitamins)}
                />
                Took Vitamins
              </label>

              <button onClick={() => {
                let healthXp = 0;
                const cal = Number(calories);

                // XP calculated from calories, water intake, and vitamins
                if (cal) healthXp += Math.round(cal / 10);
                if (water) healthXp += Math.round(water / 8);
                if (vitamins) healthXp += 5;

                const today = new Date().toISOString().split('T')[0];

                setPlans([
                  ...plans,
                  {
                    date: today,
                    meal,
                    calories,
                    water,
                    vitamins,
                    type: 'health'
                  }
                ]);

                gainXp(healthXp);
                setMeal('');
                setCalories('');
                setWater('');
                setVitamins(false);
                setShowCalories(false);
              }}>
                Log Meal
              </button>
            </div>

            {/* ── ADD FRIEND CARD ── adds a friend to the relationships list */}
            <div className="card">
              <h3>👥 Add Friend</h3>

              <input
                type="text"
                placeholder="Friend's Name"
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
              />

              <button onClick={() => {
                if (!newFriend.trim()) return;

                // Capitalize first letter, lowercase the rest
                const formattedName =
                  newFriend.charAt(0).toUpperCase() + newFriend.slice(1).toLowerCase();

                setFriends([...friends, { name: formattedName, xp: 0, level: 1 }]);
                setNewFriend('');
              }}>
                Add Friend
              </button>
            </div>

            {/* ── PLANNER CARD ── schedules an activity with a friend */}
            <div className="card">
              <h3>📆 Planner</h3>

              <select value={selectedFriend} onChange={(e) => setSelectedFriend(e.target.value)}>
                <option value="">Select Friend</option>
                {friends.map((f, i) => (
                  <option key={i} value={f.name}>{f.name}</option>
                ))}
              </select>

              <input type="text" placeholder="What are you doing?" value={activity} onChange={(e) => setActivity(e.target.value)} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

              <button onClick={() => {
                if (!selectedFriend || !activity || !date || !startTime || !endTime) {
                  alert("Fill everything out");
                  return;
                }

                const start = new Date(`${date}T${startTime}`);
                const end = new Date(`${date}T${endTime}`);

                // If end time is before start, assume it wraps to the next day
                if (end <= start) {
                  end.setDate(end.getDate() + 1);
                }

                const durationMs = end - start;
                const durationHours = durationMs / (1000 * 60 * 60);
                const xpEarned = Math.round(durationHours * 15);

                gainXp(xpEarned);

                setPlans([
                  ...plans,
                  {
                    friend: selectedFriend,
                    activity,
                    date,
                    startTime,
                    endTime,
                    studyHours,
                    activityMinutes,
                    calories
                  }
                ]);

                // Also give the friend XP for the planned activity
                setFriends(prev =>
                  prev.map(f => {
                    if (f.name === selectedFriend) {
                      const newXp = f.xp + Math.round(durationHours * 10);
                      const newLevel = Math.floor(newXp / 100) + 1;

                      return {
                        ...f,
                        xp: newXp % 100,
                        level: newLevel
                      };
                    }
                    return f;
                  })
                );

                setSelectedFriend('');
                setDate('');
                setActivity('');
                setStartTime('');
                setEndTime('');
              }}>
                Add Plan
              </button>
            </div>

            {/* ── RELATIONSHIPS CARD ── displays all friends and their levels */}
            <div className="card">
              <h3>💕 Relationships</h3>
              {friends.map((f, i) => (
                <div key={i}>
                  {f.name} - Level {f.level} ({f.xp} XP)
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
