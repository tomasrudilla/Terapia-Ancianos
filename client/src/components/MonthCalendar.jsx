const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const WORK_DAYS = [1, 2, 3, 4, 5];

function fmtDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function MonthCalendar({
  view,
  onPrev,
  onNext,
  daysWithSlots = new Set(),
  daysWithEvents = new Set(),
  selectedDate,
  onSelectDate,
  eventsOnly = false,
}) {
  const year = view.getFullYear();
  const month = view.getMonth();
  const todayStr = fmtDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push(<span key={`e-${i}`} className="cal-day other-month" aria-hidden="true" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = fmtDate(year, month, day);
    const dow = new Date(year, month, day).getDay() || 7;
    const isPast = dateStr < todayStr;
    const disabled =
      isPast ||
      !WORK_DAYS.includes(dow) ||
      (eventsOnly && !daysWithEvents.has(dateStr));

    const cls = [
      'cal-day',
      dateStr === todayStr ? 'today' : '',
      dateStr === selectedDate ? 'selected' : '',
      daysWithSlots.has(dateStr) ? 'has-slots' : '',
      daysWithEvents.has(dateStr) ? 'has-events' : '',
    ]
      .filter(Boolean)
      .join(' ');

    cells.push(
      <button
        key={dateStr}
        type="button"
        className={cls}
        disabled={disabled}
        onClick={() => onSelectDate(dateStr)}
      >
        {day}
      </button>,
    );
  }

  return (
    <>
      <div className="calendar-header">
        <h2 id="cal-month-label">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="calendar-nav">
          <button type="button" onClick={onPrev} aria-label="Mes anterior">
            ‹
          </button>
          <button type="button" onClick={onNext} aria-label="Mes siguiente">
            ›
          </button>
        </div>
      </div>
      <div className="calendar-weekdays">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="calendar-days" role="grid" aria-labelledby="cal-month-label">
        {cells}
      </div>
    </>
  );
}
