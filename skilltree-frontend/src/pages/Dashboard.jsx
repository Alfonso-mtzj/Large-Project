import { useAuth } from '../context/AuthContext';
import './dashboard.css';
import bg from '../assets/auth/dashboard.png';
import { useState, useEffect } from 'react'; //keeps friends

export default function Dashboard() {
  const { user } = useAuth();

  //Intelligence
  const [studyHours, setStudyHours] = useState(0);

  //Strength
  const [activityMinutes, setActivityMinutes] = useState(0);

  //Health
  const [meal, setMeal] = useState('');
  const [showCalories, setShowCalories] = useState(false);
  const [calories, setCalories] = useState('');

  //Relationship
  const [newFriend, setNewFriend] = useState('');
  const [selectedFriend, setSelectedFriend] = useState('');
  const [activity, setActivity] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [friends, setFriends] = useState([]);
  const [plans, setPlans] = useState([]);
  const [date, setDate] = useState('');

  //Calendar
  const [selectedDate, setSelectedDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  //User
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const maxXp = 100;
  const xpPercent = (xp / maxXp) * 100;

  const gainXp = (amount) => {
    let newXp = xp + amount;

    if (newXp >= maxXp) {
      setLevel(prev => prev + 1);
      newXp = newXp - maxXp;
    }

    setXp(newXp);
  };

  // LOAD DATA
  useEffect(() => {
    const savedFriends = localStorage.getItem('friends');
    const savedPlans = localStorage.getItem('plans');

    if (savedFriends) setFriends(JSON.parse(savedFriends));
    if (savedPlans) setPlans(JSON.parse(savedPlans));
  }, []);

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('plans', JSON.stringify(plans));
  }, [plans]);

  //Calendar Grid Set-up
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // empty slots before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const fullDate = new Date(year, month, d);
      const formatted = fullDate.toISOString().split('T')[0];

      days.push(formatted);
    }

    return days;
  };
  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth(currentDate);
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

          {/* Add Friend */}
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

              setFriends([
                ...friends,
                { name: newFriend, xp: 0, level: 1 }
              ]);

              setNewFriend('');
            }}>
              Add Friend
            </button>
          </div>

          {/* RELATIONSHIPS */}
         <div className="card">
            <h3>📆Planner</h3>

            {/* Friend dropdown */}
            <select
              value={selectedFriend}
              onChange={(e) => setSelectedFriend(e.target.value)}
            >
              <option value="">Select Friend</option>
              {friends.map((f, i) => (
                <option key={i} value={f.name}>{f.name}</option>
              ))}
            </select>

            {/* Activity */}
            <input
              type="text"
              placeholder="What are you doing?"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />
           
            {/* Date */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
           
            {/* Time */}
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />

            <button onClick={() => {
              console.log({ selectedFriend, activity, startTime, endTime });
      
              if (!selectedFriend || !activity || !date || !startTime || !endTime) {
                alert("You must fill everything out");
                return;
              }

              //xp based on time
              const start = new Date(`${date}T${startTime}`);
              const end = new Date(`${date}T${endTime}`);
              const durationHours = (end - start) / (1000 * 60 * 60);

              // give player xp
              gainXp(Math.round(durationHours * 10));

              // give friend xp
              const updatedFriends = friends.map(f => {
                if (f.name === selectedFriend) {
                  let newXp = f.xp + 10;
                  let newLevel = f.level;

                  if (newXp >= 50) {
                    newLevel++;
                    newXp -= 50;
                  }

                  return { ...f, xp: newXp, level: newLevel };
                }
                return f;
              });

              setFriends(updatedFriends);

              // save plan
              setPlans([
                ...plans,
                {
                  friend: selectedFriend,
                  activity,
                  date,
                  startTime,
                  endTime
                }
              ]);

              setSelectedFriend('');
              setDate('');
              setActivity('');
              setStartTime('');
              setEndTime('');
            }}>
              Add Plan
            </button>
          </div>

          {/* Friend Levels */}
          <div className="card">
            <h3>💕 Relationships</h3>
            {friends.map((f, i) => (
              <div key={i}>
                {f.name} - Level {f.level} ({f.xp} XP)
              </div>
            ))}
          </div>

          <div className="card">
            <h3>📅 Calendar</h3>

            {/* Month controls */}
            <div className="calendarHeader">
              <button onClick={() => changeMonth(-1)}>◀</button>
              <span>
                {currentDate.toLocaleString('default', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <button onClick={() => changeMonth(1)}>▶</button>
            </div>

            {/* Grid */}
            <div className="calendarGrid">
              {days.map((day, i) => {
                const dayPlans = plans.filter(p => p.date === day);
                
                return (
                  <div
                    key={i}
                    className={`calendarCell ${
                      day === selectedDate ? 'selectedDay' : ''
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <div className="dayNumber">
                          {new Date(day).getDate()}
                        </div>
                        
                        {dayPlans.length > 0 && (
                          <div className="eventDot"></div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected day plans */}
            <div className="dayPlans">
              <h4>{selectedDate || "Select a day"}</h4>
            
              {plans
                .filter(p => p.date === selectedDate)
                .map((p, i) => (
                  <div key={i}>
                    {p.friend}: {p.activity}<br />
                    {p.startTime} - {p.endTime}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
