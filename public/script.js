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

// Live updates: refresh the grid whenever the admin adds/deletes a station,
// and refresh the open station's time list if it just got a new time.
socket.on('stationsChanged', (payload) => {
  loadUserStations();

  if (payload.type === 'timeAdded' && payload.station._id === currentActiveStationId) {
    joinStation(currentActiveStationId);
  }
});

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

  // If the admin hasn't set any metro times yet, show a single default fallback slot.
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

  try {
    const res = await fetch(`/api/v1/stations/${stationId}/join`, { method: 'POST' });
    const data = await res.json();
    document.getElementById('viewer-count').innerText = data.count;
  } catch (err) {
    console.error('Error updating viewer count:', err);
  }
}

async function leaveStation() {
  if (currentActiveStationId) {
    try {
      const res = await fetch(`/api/v1/stations/${currentActiveStationId}/leave`, { method: 'POST' });
      await res.json();
    } catch (err) {
      console.error('Error leaving station:', err);
    }
    currentActiveStationId = null;
  }

  document.getElementById('announcement-banner').style.display = 'none';
  document.getElementById('active-station-view').style.display = 'none';
  document.getElementById('station-grid-view').style.display = 'block';
}

function reserveSlot(stationName, timeString) {
  const banner = document.getElementById('announcement-banner');
  const bannerText = document.getElementById('announcement-text');

  bannerText.innerText = `// SUCCESS: TICKET SECURED FOR ${stationName.toUpperCase()} AT ${timeString}`;
  banner.style.display = 'block';

  banner.classList.remove('glow-effect');
  void banner.offsetWidth;
  banner.classList.add('glow-effect');

  setTimeout(() => {
    banner.style.display = 'none';
  }, 5000);
}