(function () {
  const monthLabel = document.getElementById('cal-month-label');
  const daysEl = document.getElementById('cal-days');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const slotsGrid = document.getElementById('slots-grid');
  const slotsEmpty = document.getElementById('slots-empty');
  const dayEventsSection = document.getElementById('day-events-section');
  const dayEventsList = document.getElementById('day-events-list');
  const form = document.getElementById('booking-form');
  const alertEl = document.getElementById('booking-alert');
  const summaryDt = document.getElementById('summary-datetime');
  const fieldDate = document.getElementById('field-date');
  const fieldTime = document.getElementById('field-time');
  const submitBtn = document.getElementById('submit-booking');

  if (!daysEl) return;

  let view = new Date();
  view.setDate(1);
  let selectedDate = null;
  let selectedTime = null;
  let daysWithSlots = new Set();
  let daysWithEvents = new Set();
  const workDays = [1, 2, 3, 4, 5];

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function fmtDate(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function fmtDisplay(dateStr, timeStr) {
    const [y, m, day] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, day);
    const label = dt.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return `${label} · ${timeStr} hs`;
  }

  function monthKey(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderEventCard(ev) {
    const card = document.createElement('article');
    card.className = 'event-card event-card-compact';
    let participants = '';
    if (ev.registration_count === 0) {
      participants = '<p class="event-participants-empty">Sin inscriptos aún</p>';
    } else {
      participants = '<ul class="participant-list">';
      ev.participants.forEach((p) => {
        participants += `<li>${escapeHtml(p.name)}</li>`;
      });
      participants += '</ul>';
    }
    card.innerHTML = `
      <div class="event-card-head">
        <span class="badge badge-event">Evento grupal</span>
        <span class="event-time">${ev.start_time} – ${ev.end_time} hs</span>
      </div>
      <h4 class="event-title">${escapeHtml(ev.title)}</h4>
      <p class="event-meta"><strong>${ev.registration_count}/${ev.max_participants}</strong> inscriptos</p>
      ${participants}
      <p class="event-block-note">No se puede reservar sesión individual en este horario.</p>
    `;
    const link = document.createElement('a');
    link.href = `${window.EVENTOS_PAGE}?event=${ev.id}`;
    link.className = 'btn btn-secondary btn-block';
    link.textContent = ev.is_full ? 'Ver evento (completo)' : 'Unirme a este evento';
    card.appendChild(link);
    return card;
  }

  async function fetchMonth() {
    const res = await fetch(`${window.BOOKING_API}?month=${monthKey(view)}`);
    const data = await res.json();
    daysWithSlots = new Set(data.days_with_slots || []);
    daysWithEvents = new Set(data.days_with_events || []);
  }

  function dayHasActivity(dateStr) {
    return daysWithSlots.has(dateStr) || daysWithEvents.has(dateStr);
  }

  async function renderCalendar() {
    monthLabel.textContent = `${monthNames[view.getMonth()]} ${view.getFullYear()}`;
    await fetchMonth();

    daysEl.innerHTML = '';
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = fmtDate(new Date());

    for (let i = 0; i < firstDow; i++) {
      const cell = document.createElement('span');
      cell.className = 'cal-day other-month';
      cell.setAttribute('aria-hidden', 'true');
      daysEl.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = fmtDate(d);
      const dow = d.getDay() === 0 ? 7 : d.getDay();
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = String(day);
      btn.dataset.date = dateStr;

      if (dateStr === todayStr) btn.classList.add('today');
      if (dateStr === selectedDate) btn.classList.add('selected');
      if (daysWithSlots.has(dateStr)) btn.classList.add('has-slots');
      if (daysWithEvents.has(dateStr)) btn.classList.add('has-events');

      const isPast = dateStr < todayStr;
      const isWorkDay = workDays.includes(dow);
      if (isPast || !isWorkDay || !dayHasActivity(dateStr)) {
        btn.disabled = true;
      }

      btn.addEventListener('click', () => selectDate(dateStr));
      daysEl.appendChild(btn);
    }
  }

  async function selectDate(dateStr) {
    selectedDate = dateStr;
    selectedTime = null;
    fieldDate.value = dateStr;
    fieldTime.value = '';
    submitBtn.disabled = true;
    summaryDt.textContent = 'Elegí un horario';
    renderCalendar();

    slotsEmpty.classList.remove('hidden');
    slotsEmpty.textContent = 'Cargando…';
    slotsGrid.classList.add('hidden');
    slotsGrid.innerHTML = '';
    if (dayEventsList) dayEventsList.innerHTML = '';
    if (dayEventsSection) dayEventsSection.hidden = true;

    const res = await fetch(`${window.BOOKING_API}?date=${dateStr}`);
    const data = await res.json();
    const slots = data.slots || [];
    const events = data.events || [];

    if (events.length > 0 && dayEventsSection && dayEventsList) {
      dayEventsSection.hidden = false;
      events.forEach((ev) => dayEventsList.appendChild(renderEventCard(ev)));
    }

    if (slots.length === 0) {
      slotsEmpty.textContent = events.length > 0
        ? 'No quedan turnos individuales libres este día (solo eventos grupales).'
        : 'No hay horarios disponibles este día.';
      return;
    }

    slotsEmpty.classList.add('hidden');
    slotsGrid.classList.remove('hidden');

    slots.forEach((time) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot-btn';
      b.textContent = time;
      b.addEventListener('click', () => {
        selectedTime = time;
        fieldTime.value = time;
        slotsGrid.querySelectorAll('.slot-btn').forEach((el) => el.classList.remove('selected'));
        b.classList.add('selected');
        summaryDt.textContent = fmtDisplay(dateStr, time);
        submitBtn.disabled = false;
      });
      slotsGrid.appendChild(b);
    });
  }

  function showAlert(msg, type) {
    alertEl.textContent = msg;
    alertEl.className = `alert alert-${type}`;
    alertEl.classList.remove('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    submitBtn.disabled = true;
    const payload = {
      date: fieldDate.value,
      time: fieldTime.value,
      client_name: form.client_name.value.trim(),
      client_email: form.client_email.value.trim(),
      client_phone: form.client_phone.value.trim(),
      notes: form.notes.value.trim(),
    };

    try {
      const res = await fetch(window.BOOKING_POST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || 'No se pudo completar la reserva', 'error');
        submitBtn.disabled = false;
        if (selectedDate) selectDate(selectedDate);
        return;
      }
      showAlert(data.message, 'success');
      form.reset();
      selectedTime = null;
      fieldTime.value = '';
      summaryDt.textContent = 'Aún no elegiste horario';
      await renderCalendar();
    } catch {
      showAlert('Error de conexión. Intentá de nuevo.', 'error');
      submitBtn.disabled = false;
    }
  });

  prevBtn.addEventListener('click', () => {
    view.setMonth(view.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener('click', () => {
    view.setMonth(view.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
})();
