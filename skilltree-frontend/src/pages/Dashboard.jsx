import { useAuth } from '../context/AuthContext';
import './dashboard.css';
import bg from '../assets/auth/dashboard.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  //intelligence
  const [studyHours, setStudyHours] = useState(0);
  const [activityMinutes, setActivityMinutes] = useState(0);

  //health
  const [meal, setMeal] = useState('');
  const [showCalories, setShowCalories] = useState(false);
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState(0);
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
                                        

  return (
    <>

      <div className="dashboardBg" style={{ backgroundImage: `url(${bg})` }}>

        <div className="dashboardFrame">
        {/* NAV */}
        <div className="navBar">
          <button className="navButton" onClick={() => navigate('/dashboard')}>🧙 Home</button>
          <button className="navButton" onClick={() => navigate('/calendar')}>📅 Calendar</button>
        </div>

          <div className="characterPanel">
            <h2>{user?.username || user?.email || "Adventurer"}</h2>
            <p>Level {level}</p>

            <div className="xpBar">
              <div className="xpFill" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>

          <div className="statsPanel">

            <div className="card">
              <h3>🧠 Intelligence</h3>
              <input
                type="number"
                placeholder="Hours studied"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
              />
              <button onClick={() => {
                const hours = Number(studyHours);
                if (!hours) return;

                gainXp(hours * 12);
                setStudyHours(0);
              }}>
                Log Study
              </button>
            </div>

            <div className="card">
              <h3>💪 Strength</h3>
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
                setActivityMinutes(0);
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
                <>
                  <input
                    type="number"
                    placeholder="Calories"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                  />
      
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
                </>
              )}

              <button onClick={() => {
                let healthXp = 0;

                const cal = Number(calories);

                if(cal) healthXp += Math.round(cal / 10);
                if(water) healthXp += Math.round(water / 8);
                if(vitamins) healthXp += 5;

                gainXp(healthXp);
                setMeal('');
                setCalories('');
                setWater(0);
                setVitamins(false);
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

                setFriends([...friends, { name: newFriend, xp: 0, level: 1 }]);
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

                const durationMs = end - start;

                if(durationMs <= 0) {
                  alert("End time must be after start time");
                  return;
                }
      
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
