let allStationsData = [];
let currentActiveStationId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('user-station-list');
  try {
    const res = await fetch('/api/v1/stations');
    allStationsData = await res.json();
    
    listEl.innerHTML = '';
    if (allStationsData.length === 0) {
      listEl.innerHTML = '<li class="station-box"><span>No active stations found in grid.</span></li>';
      return;
    }

    allStationsData.forEach(station => {
      const li = document.createElement('li');
      li.className = 'station-box';
      li.innerHTML = `
        <strong>${station.name}</strong>
        <span>Quick Schedule: ${station.metroTimes.length > 0 ? station.metroTimes[0] + ' ...' : 'No times posted'}</span>
        <button class="btn-cyan join-station-btn" onclick="joinStation('${station._id}')">JOIN STATION</button>
      `;
      listEl.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load stations:', err);
  }
});

async function joinStation(stationId) {
  const station = allStationsData.find(s => s._id === stationId);
  if (!station) return;

  currentActiveStationId = stationId;

  document.getElementById('station-grid-view').style.display = 'none';
  const activeView = document.getElementById('active-station-view');
  activeView.style.display = 'flex';

  document.getElementById('active-station-title').innerText = `// FEED: ${station.name.toUpperCase()}`;

  const timesListEl = document.getElementById('active-station-times');
  timesListEl.innerHTML = '';
  if (station.metroTimes && station.metroTimes.length > 0) {
    station.metroTimes.forEach((time) => {
      const timeLi = document.createElement('li');
      timeLi.className = 'time-slot-item';
      timeLi.innerHTML = `
        <span>🕒 ${time}</span>
        <button class="btn-green reserve-btn" onclick="reserveSlot('${station.name}', '${time}')">RESERVE</button>
      `;
      timesListEl.appendChild(timeLi);
    });
  } else {
    timesListEl.innerHTML = '<li>No specific times logged today.</li>';
  }

  const mapIframe = document.getElementById('station-map-iframe');
  const searchQuery = encodeURIComponent(station.name + ' railway station metro');
  mapIframe.src = `https://maps.google.com/maps?q=${searchQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Notify backend that a real user joined this station
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