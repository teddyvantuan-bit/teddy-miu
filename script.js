const calendar = document.querySelector('.calendar');
function refreshCalendar() {
  calendar.replaceChildren();
  weddingI18n.t('weekdays').forEach(day => {
    const cell = document.createElement('span');
    cell.className = 'weekday';
    cell.textContent = day;
    calendar.append(cell);
  });
  const firstDay = new Date(2026, 9, 1).getDay();
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement('span');
    cell.className = 'empty';
    calendar.append(cell);
  }
  for (let date = 1; date <= 31; date++) {
    const cell = document.createElement('span');
    const special = date === 18 ? 'bride-day' : date === 25 ? 'groom-day' : '';
    cell.className = special;
    cell.textContent = date;
    cell.setAttribute('aria-label', weddingI18n.t(special ? 'calendarWeddingDate' : 'calendarDate')(date));
    calendar.append(cell);
  }
}
window.refreshCalendar = refreshCalendar;
refreshCalendar();

function updateCountdowns() {
  document.querySelectorAll('[data-countdown]').forEach(element => {
    const distance = new Date(element.dataset.countdown).getTime() - Date.now();
    if (distance <= 0) {
      element.textContent = weddingI18n.t('countdownDone');
      return;
    }
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance / 3600000) % 24);
    const minutes = Math.floor((distance / 60000) % 60);
    const seconds = Math.floor((distance / 1000) % 60);
    element.textContent = `${days} ${weddingI18n.t('day')} · ${hours} ${weddingI18n.t('hour')} · ${minutes} ${weddingI18n.t('minute')} · ${seconds} ${weddingI18n.t('second')}`;
  });
}
window.updateCountdowns = updateCountdowns;
updateCountdowns();
setInterval(updateCountdowns, 1000);

document.getElementById('rsvp-form').addEventListener('submit', event => {
  event.preventDefault();
  const status = document.getElementById('form-status');
  status.dataset.messageKey = 'rsvpUnavailable';
  status.textContent = weddingI18n.t('rsvpUnavailable');
});

const toast = document.getElementById('action-toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

document.getElementById('heart-button').addEventListener('click', event => {
  const bounds = event.currentTarget.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = '♥';
    heart.style.left = `${bounds.left + Math.random() * bounds.width}px`;
    heart.style.animationDelay = `${i * 90}ms`;
    document.body.append(heart);
    setTimeout(() => heart.remove(), 1900);
  }
});

const music = document.getElementById('background-music');
const musicButton = document.getElementById('music-button');
musicButton.setAttribute('aria-pressed', 'false');
musicButton.addEventListener('click', async () => {
  if (!music.paused) {
    music.pause();
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.textContent = '♫';
    return;
  }
  try {
    await music.play();
    musicButton.setAttribute('aria-pressed', 'true');
    musicButton.textContent = '❚❚';
  } catch (_) {
    showToast(weddingI18n.t('musicUnavailable'));
  }
});
