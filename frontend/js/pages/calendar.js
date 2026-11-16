/**
 * CropSense AI – Smart Farming Calendar Page
 * Automated seasonal activity scheduler with reminder alerts and custom task creation.
 */

import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function renderCalendar(container) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayDate = new Date().getDate();

  // Load custom tasks from local storage
  const savedEvents = JSON.parse(localStorage.getItem('cropsense_calendar_events') || 'null') || [
    { date: 'Nov 05', text: 'Top dress 25 kg/ha Urea at tillering phase' },
    { date: 'Nov 12', text: 'Scheduled drip irrigation cycle (3 hours)' },
    { date: 'Nov 18', text: 'Foliar spray of Neem Oil (3 ml/L) for pest prevention' },
    { date: 'Nov 25', text: 'Secondary weeding and root aeration' },
    { date: 'Dec 08', text: 'Pre-harvest moisture assessment' },
  ];

  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${t('feature.calendar')}</h2>
      <p class="page-header__desc">Automated seasonal schedule for sowing, weeding, fertilization, and harvest reminders.</p>
    </div>

    <!-- Calendar View Card -->
    <div class="result-card">
      <div class="result-card__header">
        <h3 class="result-card__title">📅 ${currentMonth}</h3>
        <button class="btn btn--secondary btn--sm" id="btn-add-event">+ Add Farm Reminder</button>
      </div>

      <!-- 7-column day grid -->
      <div class="calendar-grid">
        <div class="calendar-day-header">Sun</div>
        <div class="calendar-day-header">Mon</div>
        <div class="calendar-day-header">Tue</div>
        <div class="calendar-day-header">Wed</div>
        <div class="calendar-day-header">Thu</div>
        <div class="calendar-day-header">Fri</div>
        <div class="calendar-day-header">Sat</div>
        ${generateCalendarDays(todayDate)}
      </div>
    </div>

    <!-- Upcoming Events List -->
    <div class="result-card" style="margin-top: 20px;">
      <h3 class="result-card__title" style="margin-bottom: 16px;">Scheduled Agricultural Operations</h3>
      <div class="calendar-events" id="calendar-event-list">
        ${renderEventItems(savedEvents)}
      </div>
    </div>

    <!-- Add Task Modal Placeholder -->
    <div id="calendar-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 16px;">
      <div style="background: #fff; border-radius: 18px; padding: 24px; max-width: 400px; width: 100%;">
        <h3 style="margin-bottom: 16px;">Add Farming Reminder</h3>
        <div class="form-group">
          <label class="form-label" for="new-event-date">Date</label>
          <input type="text" id="new-event-date" class="form-input" placeholder="e.g. Nov 15" value="Nov 15">
        </div>
        <div class="form-group">
          <label class="form-label" for="new-event-text">Operation Description</label>
          <input type="text" id="new-event-text" class="form-input" placeholder="e.g. Apply micronutrient spray">
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn--secondary btn--sm" id="btn-modal-cancel">Cancel</button>
          <button class="btn btn--primary btn--sm" id="btn-modal-save">Save Reminder</button>
        </div>
      </div>
    </div>
  `;

  const modal = container.querySelector('#calendar-modal');
  const addBtn = container.querySelector('#btn-add-event');
  const cancelBtn = container.querySelector('#btn-modal-cancel');
  const saveBtn = container.querySelector('#btn-modal-save');
  const dateInput = container.querySelector('#new-event-date');
  const textInput = container.querySelector('#new-event-text');
  const eventList = container.querySelector('#calendar-event-list');

  addBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  saveBtn.addEventListener('click', () => {
    const d = dateInput.value.trim();
    const txt = textInput.value.trim();
    if (!txt) {
      showToast('Please enter an operation description', 'warning');
      return;
    }
    savedEvents.push({ date: d, text: txt });
    localStorage.setItem('cropsense_calendar_events', JSON.stringify(savedEvents));
    eventList.innerHTML = renderEventItems(savedEvents);
    modal.style.display = 'none';
    textInput.value = '';
    showToast('Reminder added to calendar!', 'success');
  });
}

function generateCalendarDays(today) {
  let html = '';
  // Empty offset days
  for (let i = 0; i < 2; i++) {
    html += `<div class="calendar-day" style="opacity: 0.3;">${30 + i}</div>`;
  }
  for (let day = 1; day <= 30; day++) {
    const isToday = day === today ? 'is-today' : '';
    const hasEvent = [5, 12, 18, 25].includes(day) ? 'has-event' : '';
    html += `<div class="calendar-day ${isToday} ${hasEvent}">${day}</div>`;
  }
  return html;
}

function renderEventItems(events) {
  return events.map((ev) => `
    <div class="event-item">
      <div class="event-item__date">${ev.date}</div>
      <div class="event-item__text">${ev.text}</div>
    </div>
  `).join('');
}
