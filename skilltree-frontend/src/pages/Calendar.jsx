import { useState, useEffect } from 'react';
import './calendar.css';

export default function Calendar() {
  const [plans, setPlans] = useState([]);

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
    <div className="calendarBg">
      <div className="calendarContainer">

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
                  className={`calendarCell ${day === selectedDate ? 'selectedDay' : ''}`}
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

          {/* DAY DETAILS */}
          <div className="dayPlans">
            <h3>{selectedDate || "Select a day"}</h3>

            {plans
              .filter(p => p.date === selectedDate)
              .map((p, i) => (
                <div key={i} className="planLog">
                  <strong>{p.friend}</strong> — {p.activity}<br />
                  🕒 {p.startTime} - {p.endTime}<br />
                  🧠 {p.studyHours || 0}h | 💪 {p.activityMinutes || 0}m<br />
                  🍎 {p.calories || 0} cal
                </div>
              ))}
          </div>

        </div>
      </div>
    </div>
  );
}
