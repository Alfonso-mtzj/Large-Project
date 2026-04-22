import { useState, useEffect } from 'react';
import './calendar.css';
import bg from '../assets/auth/calendar_background.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Calendar() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const { logout } = useAuth();

  // ── TODAY'S DATE ──────────────────────────────────────────────────
  // Built manually from local date parts to avoid the UTC-offset bug.
  // Using new Date().toISOString() gives yesterday's date in timezones
  // behind UTC (e.g. US), which is why logged plans showed on the wrong day.
  const todayLocal = new Date();
  const today = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2,'0')}-${String(todayLocal.getDate()).padStart(2,'0')}`;

  // ── INLINE EDIT STATE ─────────────────────────────────────────────
  // Tracks which plan is being edited and what the user has typed so far
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // ── CALENDAR NAVIGATION STATE ─────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  // ── FIREFLY ANIMATION (commented out — replaced with embers) ────────
  /*
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
  */

  // ── FLOATING EMBER ANIMATION ──────────────────────────────────────
  // Creates small glowing ember particles that rise upward and fade out,
  // like embers floating off the candles and lantern in the background.
  // Each ember gets a random position, size, color, speed and drift
  // so they all look slightly different and feel organic.
  useEffect(() => {
    const container = document.querySelector('.calendarBg');
    if (!container) return;

    const embers = [];

    for (let i = 0; i < 35; i++) {
      const ember = document.createElement('div');
      ember.className = 'ember';

      // Random horizontal starting position across the full screen
      ember.style.left = Math.random() * 100 + '%';

      // Start at varying heights near the bottom
      ember.style.bottom = (Math.random() * 30) + '%';

      // Random size — smaller ones look further away
      const size = Math.random() * 5 + 2;
      ember.style.width  = size + 'px';
      ember.style.height = size + 'px';

      // Orange to red-gold color variation to match different flame temps
      const hue = Math.floor(Math.random() * 30 + 15); // 15-45 = orange/amber
      ember.style.background = 'hsl(' + hue + ', 100%, 60%)';
      ember.style.boxShadow  = '0 0 ' + (size + 2) + 'px hsl(' + hue + ', 100%, 70%)';

      // Random float speed (4s-10s) and horizontal drift (-30px to +30px)
      const duration = Math.random() * 6 + 4;
      const drift    = (Math.random() * 60 - 30).toFixed(1);
      ember.style.setProperty('--drift', drift + 'px');
      ember.style.animationDuration = duration + 's';

      // Stagger start times so they don't all launch at once
      ember.style.animationDelay = '-' + (Math.random() * duration).toFixed(1) + 's';

      container.appendChild(ember);
      embers.push(ember);
    }

    // Clean up all embers when the component unmounts
    return () => embers.forEach(e => e.remove());
  }, []);

  // ── LOAD PLANS FROM LOCALSTORAGE ON MOUNT ────────────────────────
  useEffect(() => {
    const savedPlans = localStorage.getItem('plans');
    if (savedPlans) setPlans(JSON.parse(savedPlans));
  }, []);

  // ── DELETE A PLAN ─────────────────────────────────────────────────
  // Filters out the plan at the given index and saves the result
  const deletePlan = (globalIndex) => {
    const updated = plans.filter((_, i) => i !== globalIndex);
    setPlans(updated);
    localStorage.setItem('plans', JSON.stringify(updated));
    // If we were editing this entry, cancel the edit
    if (editingIndex === globalIndex) {
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  // ── START EDITING A PLAN (inline, no prompt) ──────────────────────
  // Figures out which text field is the main label for this plan type
  // and pre-fills the input with its current value
  const startEdit = (globalIndex) => {
    const p = plans[globalIndex];
    let currentValue = '';

    if (p.type === 'intelligence') currentValue = p.studyMaterial || '';
    else if (p.type === 'strength') currentValue = p.workout || '';
    else if (p.type === 'health')   currentValue = p.meal || '';
    else                            currentValue = p.activity || ''; // planner entry

    setEditingIndex(globalIndex);
    setEditingValue(currentValue);
  };

  // ── SAVE AN EDITED PLAN ───────────────────────────────────────────
  const saveEdit = (globalIndex) => {
    if (!editingValue.trim()) return;

    const updated = [...plans];
    const p = updated[globalIndex];

    // Update the right field depending on the plan type
    if (p.type === 'intelligence') updated[globalIndex].studyMaterial = editingValue;
    else if (p.type === 'strength') updated[globalIndex].workout      = editingValue;
    else if (p.type === 'health')   updated[globalIndex].meal         = editingValue;
    else                            updated[globalIndex].activity      = editingValue;

    setPlans(updated);
    localStorage.setItem('plans', JSON.stringify(updated));
    setEditingIndex(null);
    setEditingValue('');
  };

  // ── BUILD CALENDAR GRID ───────────────────────────────────────────
  // Returns an array where null = empty cell (before the 1st of the month)
  // and a date string = a real day cell.
  // Dates are built from local year/month/day parts — NOT toISOString() —
  // to prevent the UTC-offset bug that shifts days by 1.
  const getDaysInMonth = (date) => {
    const year  = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    const days = [];

    // Push null placeholders so day 1 lands on the correct weekday column
    // e.g. if April 1 is a Tuesday (index 2), push 2 nulls first
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Push each day as a local YYYY-MM-DD string (no UTC conversion)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      days.push(`${year}-${mm}-${dd}`);
    }

    return days;
  };

  // ── NAVIGATE MONTHS ───────────────────────────────────────────────
  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // ── FORMAT A DATE STRING FOR DISPLAY ─────────────────────────────
  // Parses YYYY-MM-DD directly to avoid UTC-offset shifting the day
  const formatDateDisplay = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString();
  };

  const days = getDaysInMonth(currentDate);

  // ── WEEKDAY HEADER LABELS ─────────────────────────────────────────
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendarBg" style={{ backgroundImage: `url(${bg})` }}>
      <div className="calendarContainer">

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

        <div className="calendarCard" style={{ position: 'relative' }}>
          <h2>📅 Calendar</h2>

          {/* ── MONTH NAVIGATION ── */}
          <div className="calendarHeader">
            <button onClick={() => changeMonth(-1)}>◀</button>
            <span>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)}>▶</button>
          </div>

          {/* ── WEEKDAY HEADER ROW ── */}
          {/* Shows Sun Mon Tue Wed Thu Fri Sat above the grid so days
              align correctly — this is what makes it look like a real calendar */}
          <div className="calendarGrid">
            {weekdays.map(wd => (
              <div key={wd} className="calendarWeekday">{wd}</div>
            ))}

            {/* ── DAY CELLS ── */}
            {days.map((day, i) => {
              // Find all plans that belong to this day
              const dayPlans = day ? plans.filter(p => p.date === day) : [];

              return (
                <div
                  key={i}
                  className={`calendarCell
                    ${day === selectedDate ? 'selectedDay' : ''}
                    ${day === today       ? 'today'       : ''}
                    ${!day               ? 'emptyCell'   : ''}
                  `}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day && (
                    <>
                      {/* Day number — parsed locally so it never shows wrong date */}
                      <div className="dayNumber">
                        {Number(day.split('-')[2])}
                      </div>

                      {/* Colored dots indicate what types of logs exist on this day */}
                      <div className="dots">
                        {dayPlans.some(p => p.studyHours)           && <div className="dot blue"></div>}
                        {dayPlans.some(p => p.activityMinutes)       && <div className="dot purple"></div>}
                        {dayPlans.some(p => p.calories || p.water)   && <div className="dot red"></div>}
                        {dayPlans.some(p => p.friend)                && <div className="dot pink"></div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── DAY DETAIL PANEL ── shows logs for the selected date */}
          <div className="dayPlans">
            <h3>
              {selectedDate ? formatDateDisplay(selectedDate) : 'Select a day'}
            </h3>

            {plans
              // Only show plans for the selected date
              .map((p, globalIndex) => ({ p, globalIndex }))
              .filter(({ p }) => p.date === selectedDate)
              .map(({ p, globalIndex }) => (
                <div key={globalIndex} className="planLog">

                  {/* ── HEALTH LOG ── */}
                  {p.type === 'health' && (
                    <>
                      🍎 Health Log<br />
                      {/* If editing this entry, show an inline input instead of the label */}
                      {editingIndex === globalIndex
                        ? <input
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(globalIndex)}
                          />
                        : p.meal && <>🍴 {p.meal}<br /></>
                      }
                      {p.water    && <>💧 {p.water} oz<br /></>}
                      {p.calories && <>⚡ {p.calories} cal<br /></>}
                      {p.vitamins && <>💊 Vitamins taken</>}
                    </>
                  )}

                  {/* ── INTELLIGENCE LOG ── */}
                  {p.type === 'intelligence' && (
                    <>
                      {editingIndex === globalIndex
                        ? <input
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(globalIndex)}
                          />
                        : <>🧠 {p.studyMaterial || 'Study'}<br /></>
                      }
                      ⏱ {p.studyHours} hrs
                    </>
                  )}

                  {/* ── STRENGTH LOG ── */}
                  {p.type === 'strength' && (
                    <>
                      {editingIndex === globalIndex
                        ? <input
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(globalIndex)}
                          />
                        : <>💪 {p.workout || 'Workout'}<br /></>
                      }
                      ⏱ {p.activityMinutes} mins
                    </>
                  )}

                  {/* ── PLANNER / FRIEND LOG ── */}
                  {!p.type && (
                    <>
                      {editingIndex === globalIndex
                        ? <input
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(globalIndex)}
                          />
                        : <><strong>{p.friend}</strong> — {p.activity}<br /></>
                      }
                      🕒 {p.startTime} - {p.endTime}
                    </>
                  )}

                  {/* ── ACTION BUTTONS ── D&D themed delete and edit/save */}
                  <div className="planActions">
                    <button onClick={() => deletePlan(globalIndex)}>⚔️ Delete</button>

                    {/* Toggle between Edit and Save depending on editing state */}
                    {editingIndex === globalIndex
                      ? <button onClick={() => saveEdit(globalIndex)}>💾 Save</button>
                      : <button onClick={() => startEdit(globalIndex)}>📜 Edit</button>
                    }
                  </div>

                </div>
              ))}
          </div>

          {/* Dragon removed — replaced with floating embers */}

        </div>{/* end calendarCard */}
      </div>{/* end calendarContainer */}
    </div>
  );
}
