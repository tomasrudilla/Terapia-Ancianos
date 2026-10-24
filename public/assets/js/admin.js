(function () {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.tab;
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${id}`).classList.add('active');
    });
  });

  function monthRange(ym) {
    const [y, m] = ym.split('-').map(Number);
    const last = new Date(y, m, 0).getDate();
    return {
      from: `${y}-${String(m).padStart(2, '0')}-01`,
      to: `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`,
    };
  }

  function showFormAlert(el, msg, ok) {
    el.textContent = msg;
    el.className = `alert alert-${ok ? 'success' : 'error'}`;
    el.classList.remove('hidden');
  }

  async function loadBookings() {
    const monthInput = document.getElementById('filter-month');
    const tbody = document.querySelector('#bookings-table tbody');
    const empty = document.getElementById('bookings-empty');
    const { from, to } = monthRange(monthInput.value);

    const res = await fetch(`${window.ADMIN_API.bookings}?from=${from}&to=${to}`);
    const data = await res.json();
    const rows = data.bookings || [];
    tbody.innerHTML = '';

    if (rows.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    rows.forEach((b) => {
      const tr = document.createElement('tr');
      const statusClass = b.status === 'confirmed' ? 'badge-confirmed' : 'badge-block';
      tr.innerHTML = `
        <td>${b.booking_date}</td>
        <td>${b.booking_time}</td>
        <td>${escapeHtml(b.client_name)}</td>
        <td>${escapeHtml(b.client_email)}${b.client_phone ? '<br>' + escapeHtml(b.client_phone) : ''}</td>
        <td><span class="badge ${statusClass}">${b.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}</span></td>
        <td class="actions-inline"></td>
      `;
      const actions = tr.querySelector('.actions-inline');
      if (b.status === 'confirmed') {
        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'btn btn-ghost btn-icon';
        cancel.textContent = 'Cancelar';
        cancel.addEventListener('click', () => updateBooking(b.id, 'cancelled'));
        actions.appendChild(cancel);
      } else {
        const restore = document.createElement('button');
        restore.type = 'button';
        restore.className = 'btn btn-ghost btn-icon';
        restore.textContent = 'Reactivar';
        restore.addEventListener('click', () => updateBooking(b.id, 'confirmed'));
        actions.appendChild(restore);
      }
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn btn-danger btn-icon';
      del.textContent = 'Eliminar';
      del.addEventListener('click', () => deleteBooking(b.id));
      actions.appendChild(del);
      tbody.appendChild(tr);
    });
  }

  async function updateBooking(id, status) {
    await fetch(window.ADMIN_API.bookings, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    loadBookings();
  }

  async function deleteBooking(id) {
    if (!confirm('¿Eliminar esta reserva permanentemente?')) return;
    await fetch(window.ADMIN_API.bookings, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadBookings();
  }

  async function loadEvents() {
    const tbody = document.querySelector('#events-table tbody');
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const toDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    const to = toDate.toISOString().slice(0, 10);

    const res = await fetch(`${window.ADMIN_API.events}?from=${from}&to=${to}`);
    const data = await res.json();
    tbody.innerHTML = '';
    (data.events || []).forEach((ev) => {
      const tr = document.createElement('tr');
      let inscriptos = '—';
      if (ev.event_type === 'event' && ev.registration_count !== undefined) {
        const names = (ev.participants || []).map((p) => escapeHtml(p.name)).join(', ');
        inscriptos = `<strong>${ev.registration_count}/${ev.max_participants}</strong>`;
        if (names) inscriptos += `<br><span style="font-size:0.8rem;color:var(--text-muted)">${names}</span>`;
      }
      const blocks = ev.blocks_booking === true || ev.blocks_booking == 1 ? 'Sí' : 'No';
      tr.innerHTML = `
        <td>${ev.event_date}</td>
        <td>${ev.start_time} – ${ev.end_time}</td>
        <td>${escapeHtml(ev.title)}</td>
        <td>${inscriptos}</td>
        <td>${blocks}</td>
        <td></td>
      `;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-danger btn-icon';
      btn.textContent = 'Eliminar';
      btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar evento?')) return;
        await fetch(window.ADMIN_API.events, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ev.id }),
        });
        loadEvents();
      });
      tr.lastElementChild.appendChild(btn);
      tbody.appendChild(tr);
    });
  }

  async function loadBlocks() {
    const tbody = document.querySelector('#blocks-table tbody');
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const toDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    const to = toDate.toISOString().slice(0, 10);

    const res = await fetch(`${window.ADMIN_API.blocks}?from=${from}&to=${to}`);
    const data = await res.json();
    tbody.innerHTML = '';
    (data.blocks || []).forEach((bl) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${bl.block_date}</td>
        <td>${bl.start_time} – ${bl.end_time}</td>
        <td>${escapeHtml(bl.reason || '—')}</td>
        <td></td>
      `;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-danger btn-icon';
      btn.textContent = 'Eliminar';
      btn.addEventListener('click', async () => {
        await fetch(window.ADMIN_API.blocks, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: bl.id }),
        });
        loadBlocks();
      });
      tr.lastElementChild.appendChild(btn);
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  document.getElementById('reload-bookings')?.addEventListener('click', loadBookings);

  document.getElementById('event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const alertEl = document.getElementById('event-alert');
    const payload = {
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      event_date: form.event_date.value,
      start_time: form.start_time.value,
      end_time: form.end_time.value,
      event_type: form.event_type.value,
      blocks_booking: form.blocks_booking.checked ? 1 : 0,
      max_participants: parseInt(form.max_participants.value, 10) || 12,
    };
    const res = await fetch(window.ADMIN_API.events, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      showFormAlert(alertEl, data.error || 'Error al guardar', false);
      return;
    }
    showFormAlert(alertEl, 'Evento creado correctamente', true);
    form.reset();
    form.start_time.value = '10:00';
    form.end_time.value = '12:00';
    form.blocks_booking.checked = true;
    loadEvents();
  });

  document.getElementById('block-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const alertEl = document.getElementById('block-alert');
    const payload = {
      block_date: form.block_date.value,
      start_time: form.start_time.value,
      end_time: form.end_time.value,
      reason: form.reason.value.trim(),
    };
    const res = await fetch(window.ADMIN_API.blocks, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      showFormAlert(alertEl, data.error || 'Error al guardar', false);
      return;
    }
    showFormAlert(alertEl, 'Horario bloqueado', true);
    form.reset();
    form.start_time.value = '09:00';
    form.end_time.value = '13:00';
    loadBlocks();
  });

  loadBookings();
  loadEvents();
  loadBlocks();
})();
