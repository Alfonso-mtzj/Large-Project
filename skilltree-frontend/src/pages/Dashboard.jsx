
import { useAuth } from '../context/AuthContext';
import './dashboard.css';
import bg from '../assets/auth/dashboard.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  console.log("USER IN DASHBOARD:", user);

  //intelligence
  const [studyHours, setStudyHours] = useState('');
  const [studyMinutes, setStudyMinutes] = useState('');
  const [studyMaterial, setStudyMaterial] = useState('');

  //Strength
  const [activityMinutes, setActivityMinutes] = useState('');
  const [workout, setWorkout] = useState('');

  //health
  const [meal, setMeal] = useState('');
  const [showCalories, setShowCalories] = useState(false);
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');
  const [vitamins, setVitamins] = useState(false);

  //relationships
  const [newFriend, setNewFriend] = useState('');
  const [selectedFriend, setSelectedFriend] = useState('');
  const [activity, setActivity] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState('');

  const [friends, setFriends] = useState([]);
  const [plans, setPlans] = useState([]);
  const today = new Date().toISOString().split('T')[0];

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const maxXp = 100;
  const xpPercent = (xp / maxXp) * 100;

  const gainXp = (amount) => {
    let newXp = xp + amount;

    if (newXp >= maxXp) {
      setLevel(prev => prev + 1);
      newXp -= maxXp;
    }

    setXp(newXp);
  };

  useEffect(() => {
    const savedFriends = localStorage.getItem('friends');
    const savedPlans = localStorage.getItem('plans');

    if (savedFriends) setFriends(JSON.parse(savedFriends));
    if (savedPlans) setPlans(JSON.parse(savedPlans));
  }, []);

  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    const savedXp = localStorage.getItem('xp');
    const savedLevel = localStorage.getItem('level');

    if(savedXp) setXp(Number(savedXp));
    if(savedLevel) setLevel(Number(savedLevel));
  }, []);

  useEffect(() => {
    localStorage.setItem('xp', xp);
    localStorage.setItem('level', level);
  }, [xp, level]);


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
        {/* NAV */}
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

          <div className="characterPanel">
            <h2>
              {user === null
                ? "Loading..."
                : `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Adventurer"}
            </h2>
            
            <p>Level {level}</p>

            <div className="xpBar">
              <div className="xpFill" style={{ width: `${xpPercent}%` }} />
            </div>

            <p className="characterDate">
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>

          <div className="statsPanel">

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
                if(!mins) return;

                gainXp(Math.round(mins/5)); //1 xp per min

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

                if(cal) healthXp += Math.round(cal / 10);
                if(water) healthXp += Math.round(water / 8);
                if(vitamins) healthXp += 5;

                //adding it as a plan
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

                const formattedName =
                  newFriend.charAt(0).toUpperCase() + newFriend.slice(1).toLowerCase();
      
                setFriends([...friends, { name: formattedName, xp: 0, level: 1 }]);
                setNewFriend('');
              }}>
                Add Friend
              </button>
            </div>

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

                if(end <= start) {
                  end.setDate(end.getDate() + 1);
                }
                const durationMs = end - start;
                const durationHours = durationMs / (1000 * 60 * 60);
                const xpEarned = Math.round(durationHours * 15);

                gainXp(xpEarned);

                setPlans([
                  ...plans,
                  {
                    type: 'planner',   // explicit type so Calendar can identify it
                    friend: selectedFriend,
                    activity,
                    date,
                    startTime,
                    endTime
                  }
                ]);

                setFriends(prev =>
                  prev.map(f => {
                    if (f.name === selectedFriend) {
                      // Correctly carry XP over multiple level-ups
                      // e.g. if friend is at 90xp and earns 25, they level up
                      // and have 15xp remaining, not a broken negative/wrong value
                      let earned = Math.round(durationHours * 10);
                      let newXp  = f.xp + earned;
                      let newLevel = f.level;

                      while (newXp >= 100) {
                        newXp -= 100;
                        newLevel += 1;
                      }

                      return { ...f, xp: newXp, level: newLevel };
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

            <div className="card">
              <h3>💕 Relationships</h3>

              {friends.length === 0 && (
                <p style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.9rem' }}>
                  No friends added yet.
                </p>
              )}

              {friends.map((f, i) => {
                // Each friend has their own XP bar capped at 100
                const friendMaxXp = 100;
                const friendXpPercent = Math.min((f.xp / friendMaxXp) * 100, 100);

                return (
                  <div key={i} style={{
                    marginBottom: '14px',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>

                    {/* Friend name + delete button on same row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        {f.name}
                      </span>

                      {/* ⚔️ Delete friend button */}
                      {/* Small X icon button — unobtrusive but clearly a remove action */}
                      <button
                        title={`Remove ${f.name}`}
                        onClick={() => {
                          // Remove the friend AND all plans associated with them
                          // so the calendar doesn't show orphaned entries
                          const updatedFriends = friends.filter((_, idx) => idx !== i);
                          setFriends(updatedFriends);

                          const updatedPlans = plans.filter(p => p.friend !== f.name);
                          setPlans(updatedPlans);
                          localStorage.setItem('plans', JSON.stringify(updatedPlans));
                        }}
                        style={{
                          background: 'rgba(139,17,17,0.5)',
                          color: '#ffaaaa',
                          border: '1px solid rgba(255,100,100,0.25)',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          lineHeight: 1,
                          padding: 0,
                          flexShrink: 0
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Level and XP text */}
                    <div style={{ fontSize: '0.82rem', opacity: 0.7, marginBottom: '6px' }}>
                      Level {f.level} &nbsp;•&nbsp; {f.xp} / {friendMaxXp} XP
                    </div>

                    {/* XP bar for this friend */}
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${friendXpPercent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #b45309, #f59e0b)',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
