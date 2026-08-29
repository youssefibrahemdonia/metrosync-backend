let allStationsData = [];
let currentActiveStationId = null;

const socket = io();

async function loadUserStations() {
  const listEl = document.getElementById('user-station-list');
  try {
    const res = await fetch('/api/v1/stations');
    allStationsData = await res.json();

    listEl.innerHTML = '';
    if (allStationsData.length === 0) {
      listEl.innerHTML = '<li class="station-box"><span>No active stations found in grid.</span></li>';
      return;
    }

    allStationsData.forEach((station, index) => {
      const li = document.createElement('li');
      li.className = 'station-box fade-in-item';
      li.style.animationDelay = `${index * 0.08}s`;

      const quickTime = station.metroTimes.length > 0
        ? station.metroTimes[0] + ' ...'
        : 'No custom schedule — default: 09:00 AM';

      li.innerHTML = `
        <strong>${station.name}</strong>
        <span>Quick Schedule: ${quickTime}</span>
        <button class="btn-cyan join-station-btn" onclick="joinStation('${station._id}')">JOIN STATION</button>
      `;
      listEl.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load stations:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadUserStations);

socket.on('stationsChanged', (payload) => {
  loadUserStations();

  if (payload.type === 'timeAdded' && payload.station._id === currentActiveStationId) {
    joinStation(currentActiveStationId);
  }
});

socket.on('presenceUpdate', ({ stationId, viewerCount }) => {
  if (stationId === currentActiveStationId) {
    document.getElementById('viewer-count').innerText = viewerCount;
  }
});

// Live announcement broadcast — only shown if the user is currently viewing that station.
socket.on('newAnnouncement', (announcement) => {
  if (announcement.station === currentActiveStationId) {
    showAnnouncementBanner(`// ADMIN ANNOUNCEMENT: ${announcement.text}`);
  }
});

function showAnnouncementBanner(message) {
  const banner = document.getElementById('announcement-banner');
  const bannerText = document.getElementById('announcement-text');

  bannerText.innerText = message;
  banner.style.display = 'block';

  banner.classList.remove('glow-effect');
  void banner.offsetWidth;
  banner.classList.add('glow-effect');

  setTimeout(() => {
    banner.style.display = 'none';
  }, 6000);
}

async function joinStation(stationId) {
  const station = allStationsData.find(s => s._id === stationId);
  if (!station) return;

  currentActiveStationId = stationId;

  document.getElementById('station-grid-view').style.display = 'none';
  const activeView = document.getElementById('active-station-view');
  activeView.style.display = 'flex';
  activeView.classList.remove('fade-in-panel');
  void activeView.offsetWidth;
  activeView.classList.add('fade-in-panel');

  document.getElementById('active-station-title').innerText = `// FEED: ${station.name.toUpperCase()}`;

  const timesListEl = document.getElementById('active-station-times');
  timesListEl.innerHTML = '';

  const timesToShow = station.metroTimes && station.metroTimes.length > 0
    ? station.metroTimes
    : ['09:00 AM (Default Schedule — no custom time set yet)'];

  timesToShow.forEach((time, index) => {
    const timeLi = document.createElement('li');
    timeLi.className = 'time-slot-item fade-in-item';
    timeLi.style.animationDelay = `${index * 0.08}s`;
    timeLi.innerHTML = `
      <span>🕒 ${time}</span>
      <button class="btn-green reserve-btn" onclick="reserveSlot('${station.name}', '${time}')">RESERVE</button>
    `;
    timesListEl.appendChild(timeLi);
  });

  const mapIframe = document.getElementById('station-map-iframe');
  const searchQuery = encodeURIComponent(station.name + ' railway station metro');
  mapIframe.src = `https://maps.google.com/maps?q=${searchQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  socket.emit('joinStation', { stationId });
}

function leaveStation() {
  socket.emit('leaveStation');
  currentActiveStationId = null;

  document.getElementById('announcement-banner').style.display = 'none';
  document.getElementById('active-station-view').style.display = 'none';
  document.getElementById('station-grid-view').style.display = 'block';
}

function reserveSlot(stationName, timeString) {
  showAnnouncementBanner(`// SUCCESS: TICKET SECURED FOR ${stationName.toUpperCase()} AT ${timeString}`);
}