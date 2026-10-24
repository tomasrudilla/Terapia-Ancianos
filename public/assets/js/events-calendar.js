(function () {
  const monthLabel = document.getElementById('cal-month-label');
  const daysEl = document.getElementById('cal-days');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const eventsEmpty = document.getElementById('events-empty');
  const eventsList = document.getElementById('events-list');
  const form = document.getElementById('event-signup-form');
  const alertEl = document.getElementById('event-alert');
  const summaryEvent = document.getElementById('summary-event');
  const fieldEventId = document.getElementById('field-event-id');
  const submitBtn = document.getElementById('submit-event');

  if (!daysEl) return;

  let view = new Date();
  view.setDate(1);
  let selectedDate = null;
  let selectedEventId = null;
  let daysWithEvents = new Set();

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

  function monthKey(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  }

  function fmtEventSummary(ev) {
    const [y, m, day] = ev.event_date.split('-').map(Number);
    const dt = new Date(y, m - 1, day);
    const label = dt.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    return `${ev.title} · ${label} · ${ev.start_time}–${ev.end_time} hs`;
  }

  function renderParticipants(ev) {
    const count = ev.registration_count;
    const max = ev.max_participants;
    let html = `<p class="event-meta"><strong>${count}/${max}</strong> personas inscriptas</p>`;
    if (count === 0) {
      html += '<p class="event-participants-empty">Todavía no hay inscriptos. ¡Sé el primero!</p>';
    } else {
      html += '<ul class="participant-list">';
      ev.participants.forEach((p) => {
        html += `<li>${escapeHtml(p.name)}</li>`;
      });
      html += '</ul>';
    }
    return html;
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function buildEventCard(ev, selectable) {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.dataset.eventId = String(ev.id);
    if (ev.is_full) card.classList.add('event-card-full');
    card.innerHTML = `
      <div class="event-card-head">
        <span class="badge badge-event">Grupal</span>
        <span class="event-time">${ev.start_time} – ${ev.end_time} hs</span>
      </div>
      <h4 class="event-title">${escapeHtml(ev.title)}</h4>
      ${ev.description ? `<p class="event-desc">${escapeHtml(ev.description)}</p>` : ''}
      ${renderParticipants(ev)}
      <p class="event-block-note">En este horario no hay turnos individuales.</p>
    `;
    if (selectable && !ev.is_full) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary btn-block event-select-btn';
      btn.textContent = 'Anotarme a este evento';
      btn.addEventListener('click', () => selectEvent(ev));
      card.appendChild(btn);
    } else if (ev.is_full) {
      const full = document.createElement('p');
      full.className = 'event-full-label';
      full.textContent = 'Cupos completos';
      card.appendChild(full);
    }
    return card;
  }

  function selectEvent(ev) {
    selectedEventId = ev.id;
    fieldEventId.value = String(ev.id);
    summaryEvent.textContent = fmtEventSummary(ev);
    submitBtn.disabled = false;
    document.querySelectorAll('.event-card').forEach((c) => c.classList.remove('event-card-selected'));
    document.querySelector(`.event-card[data-event-id="${ev.id}"]`)?.classList.add('event-card-selected');
    alertEl.classList.add('hidden');
    document.getElementById('signup-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function fetchMonth() {
    const res = await fetch(`${window.EVENTS_API}?month=${monthKey(view)}`);
    const data = await res.json();
    daysWithEvents = new Set(data.days_with_events || []);
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
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = String(day);
      btn.dataset.date = dateStr;

      if (dateStr === todayStr) btn.classList.add('today');
      if (dateStr === selectedDate) btn.classList.add('selected');
      if (daysWithEvents.has(dateStr)) btn.classList.add('has-events');

      const isPast = dateStr < todayStr;
      if (isPast || !daysWithEvents.has(dateStr)) {
        btn.disabled = true;
      }

      btn.addEventListener('click', () => selectDate(dateStr));
      daysEl.appendChild(btn);
    }
  }

  async function selectDate(dateStr) {
    selectedDate = dateStr;
    selectedEventId = null;
    fieldEventId.value = '';
    summaryEvent.textContent = 'Elegí un evento de la lista';
    submitBtn.disabled = true;
    renderCalendar();

    eventsEmpty.classList.remove('hidden');
    eventsEmpty.textContent = 'Cargando eventos…';
    eventsList.classList.add('hidden');
    eventsList.innerHTML = '';

    const res = await fetch(`${window.EVENTS_API}?date=${dateStr}`);
    const data = await res.json();
    const events = data.events || [];

    if (events.length === 0) {
      eventsEmpty.textContent = 'No hay eventos este día.';
      return;
    }

    eventsEmpty.classList.add('hidden');
    eventsList.classList.remove('hidden');
    events.forEach((ev) => eventsList.appendChild(buildEventCard(ev, true)));
  }

  function showAlert(msg, type) {
    alertEl.textContent = msg;
    alertEl.className = `alert alert-${type}`;
    alertEl.classList.remove('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;

    submitBtn.disabled = true;
    const payload = {
      event_id: selectedEventId,
      participant_name: form.participant_name.value.trim(),
      participant_email: form.participant_email.value.trim(),
      participant_phone: form.participant_phone.value.trim(),
    };

    try {
      const res = await fetch(window.EVENT_REGISTER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || 'No se pudo completar la inscripción', 'error');
        submitBtn.disabled = false;
        return;
      }
      showAlert(data.message, 'success');
      form.reset();
      fieldEventId.value = '';
      selectedEventId = null;
      summaryEvent.textContent = 'Elegí un evento de la lista';
      if (selectedDate) await selectDate(selectedDate);
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

  async function initPreselect() {
    const id = window.PRESELECT_EVENT;
    if (!id) {
      renderCalendar();
      return;
    }
    const res = await fetch(`${window.EVENTS_API}?id=${id}`);
    const data = await res.json();
    if (data.event) {
      const [y, m] = data.event.event_date.split('-').map(Number);
      view = new Date(y, m - 1, 1);
      await renderCalendar();
      await selectDate(data.event.event_date);
      selectEvent(data.event);
    } else {
      renderCalendar();
    }
  }

  initPreselect();
})();
