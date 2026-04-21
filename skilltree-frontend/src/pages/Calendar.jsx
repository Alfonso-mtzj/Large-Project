import { useState, useEffect } from 'react';
import './calendar.css';
import bg from '../assets/auth/calendar_background.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Calendar() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const { logout } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  const deletePlan = (index) => {
    const updated = plans.filter((_, i) => i !== index);
    setPlans(updated);
    localStorage.setItem('plans', JSON.stringify(updated));
  };

  useEffect(() => {
    const savedPlans = localStorage.getItem('plans');
    if (savedPlans) setPlans(JSON.parse(savedPlans));
  }, []);

  const [selectedDate, setSelectedDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

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
    <div className="calendarBg" style={{ backgroundImage: `url(${bg})` }}>
      <div className="calendarContainer">

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
        
        <div className="calendarCard">
          <h2>📅 Calendar</h2>

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

          <div className="calendarGrid">
            {days.map((day, i) => {
              const dayPlans = plans.filter(p => p.date === day);

              return (
                <div
                  key={i}
                  className={`calendarCell
                    ${day === selectedDate ? 'selectedDay' : ''}
                    ${day === today ? 'today' : ''}
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  {day && (
                    <>
                      <div className="dayNumber">
                        {new Date(day).getDate()}
                      </div>

                      <div className="dots">
                        {dayPlans.some(p => p.studyHours) && <div className="dot blue"></div>}
                        {dayPlans.some(p => p.activityMinutes) && <div className="dot purple"></div>}
                        {dayPlans.some(p => p.calories || p.water) && <div className="dot red"></div>}
                        {dayPlans.some(p => p.friend) && <div className="dot pink"></div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* DAY DETAILS */}
          <div className="dayPlans">
            <h3>{selectedDate
              ? new Date(selectedDate).toLocaleDateString()
              : "Select a day"}
            </h3>

            {plans
              .filter(p => p.date === selectedDate)
              .map((p, i) => (
                <div key={i} className="planLog">
                  {p.type === 'health' && (
                    <>
                      🍎 Health Log<br />
                      {p.meal && <>🍴 {p.meal}<br /></>}
                      {p.water && <>💧 {p.water} oz<br /></>}
                      {p.calories && <>⚡ {p.calories} cal<br /></>}
                      {p.vitamins && <>💊 Vitamins taken</>}
                    </>
                  )}
                  <div style={{ marginTop: '8px' }}>
                    <button onClick={() => deletePlan(i)}>❌</button>
                    <button onClick={() => alert("Edit coming next 👀")}>✏️</button>
                  </div>
                  
                  {p.type === 'intelligence' && (
                    <>
                      🧠 {p.studyMaterial || "Study"}<br />
                      ⏱ {p.studyHours} hrs
                    </>
                  )}

                  {p.type === 'strength' && (
                    <>
                      💪 {p.workout || "Workout"}<br />
                      ⏱ {p.activityMinutes} mins
                    </>
                      
                  )}

                  {!p.type && (
                    <>
                      <strong>{p.friend}</strong> — {p.activity}<br />
                      🕒 {p.startTime} - {p.endTime}
                    </>
                  )}
                </div>
              ))}
          </div>

        </div>
      </div>
    </div>
  );
}
