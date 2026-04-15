import { useState, useEffect } from 'react';
import './dashboard.css';

export default function Calendar({ plans }) {

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
    <div className="dashboardBg">
      <div className="dashboardFrame">

        <div className="card calendarCard">
          <h3>📅 Calendar</h3>

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

          {/* DAY DETAILS */}
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
  );
}
